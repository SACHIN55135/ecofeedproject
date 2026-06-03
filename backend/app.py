import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt

# Local imports
from config import Config
from models import db, User, NGO, Donation, PickupRequest, Feedback

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for frontend integration
CORS(app, resources={r"/api/*": {"origins": "*"}})

db.init_app(app)

# --- DATABASE INITIALIZATION ON FIRST RUN ---
with app.app_context():
    db.create_all()

# --- JWT DECORATOR HELPER ---
def token_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            # Decode token using app secret
            data = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token verification failed!', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated


# --- AUTH ROUTES ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('name') or not data.get('email') or not data.get('password') or not data.get('phone') or not data.get('role'):
        return jsonify({'message': 'Missing mandatory user fields'}), 400
        
    role = data.get('role')
    if role not in ['Donor', 'NGO', 'Admin']:
        return jsonify({'message': 'Invalid user role'}), 400
        
    # Check if user already exists
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'message': 'Email address already registered'}), 409
        
    try:
        new_user = User(
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            role=role
        )
        new_user.set_password(data.get('password'))
        db.session.add(new_user)
        db.session.commit()
        
        # Secondary tables setup for NGOs
        if role == 'NGO':
            if not data.get('organization_name') or not data.get('address'):
                # Rollback user
                db.session.delete(new_user)
                db.session.commit()
                return jsonify({'message': 'NGO requires organization_name and address'}), 400
                
            new_ngo = NGO(
                user_id=new_user.id,
                organization_name=data.get('organization_name'),
                address=data.get('address'),
                contact_number=data.get('phone'), # fallback
                verification_status='Pending' # Admins must approve
            )
            db.session.add(new_ngo)
            db.session.commit()
            
        return jsonify({
            'message': 'Registration successful',
            'user': new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
        
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not user.check_password(data.get('password')):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    # Check if NGO is pending verification (optional strict flag if needed)
    # For a flexible experience, let them log in, but limit action capacity in claims
    
    # Generate JWT token expiring in 24 hours
    token = jwt.encode({
        'user_id': user.id,
        'role': user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['JWT_SECRET'], algorithm='HS256')
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200


@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_profile(current_user):
    return jsonify(current_user.to_dict()), 200


# --- DONATIONS CRUD ROUTES ---

@app.route('/api/donations', methods=['GET'])
def get_donations():
    # Supports filtering by food_type, status, and searching
    status_filter = request.args.get('status', None)
    food_type_filter = request.args.get('food_type', None)
    search_query = request.args.get('search', None)
    
    query = Donation.query
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    if food_type_filter:
        query = query.filter_by(food_type=food_type_filter)
    if search_query:
        query = query.filter(
            (Donation.food_name.ilike(f'%{search_query}%')) |
            (Donation.pickup_address.ilike(f'%{search_query}%'))
        )
        
    # Order by newest first
    donations = query.order_by(Donation.created_at.desc()).all()
    return jsonify([d.to_dict() for d in donations]), 200


@app.route('/api/donations', methods=['POST'])
@token_required
def create_donation(current_user):
    if current_user.role != 'Donor':
        return jsonify({'message': 'Unauthorized: Only food donors can post listings'}), 403
        
    data = request.json
    if not data or not data.get('food_name') or not data.get('quantity') or not data.get('food_type') or not data.get('expiry_time') or not data.get('pickup_address'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    try:
        # Parse Expiry Time ISO format
        expiry_dt = datetime.datetime.fromisoformat(data.get('expiry_time').replace('Z', '+00:00'))
        
        new_donation = Donation(
            donor_id=current_user.id,
            food_name=data.get('food_name'),
            quantity=data.get('quantity'),
            food_type=data.get('food_type'),
            expiry_time=expiry_dt,
            pickup_address=data.get('pickup_address'),
            image_url=data.get('image_url'),
            status='Available'
        )
        db.session.add(new_donation)
        db.session.commit()
        return jsonify({'message': 'Donation listed successfully', 'donation': new_donation.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to list donation', 'error': str(e)}), 500


@app.route('/api/donations/<int:donation_id>', methods=['GET'])
def get_donation_detail(donation_id):
    donation = Donation.query.get_or_400(donation_id)
    return jsonify(donation.to_dict()), 200


@app.route('/api/donations/<int:donation_id>/cancel', methods=['PUT'])
@token_required
def cancel_donation(current_user, donation_id):
    donation = Donation.query.get_or_404(donation_id)
    if donation.donor_id != current_user.id and current_user.role != 'Admin':
        return jsonify({'message': 'Forbidden: You do not own this listing'}), 403
        
    if donation.status == 'Picked Up':
        return jsonify({'message': 'Cannot cancel a donation that has already been picked up'}), 400
        
    try:
        donation.status = 'Cancelled'
        # Cancel any active pickup request associated
        pickups = PickupRequest.query.filter_by(donation_id=donation_id).all()
        for p in pickups:
            p.pickup_status = 'Cancelled'
            
        db.session.commit()
        return jsonify({'message': 'Donation cancelled successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to cancel donation', 'error': str(e)}), 500


# --- NGO LOGISTICS CLAIMS ROUTES ---

@app.route('/api/pickups/claim', methods=['POST'])
@token_required
def claim_donation(current_user):
    if current_user.role != 'NGO':
        return jsonify({'message': 'Unauthorized: Only verified NGOs can claim donations'}), 403
        
    # Check NGO profile status
    ngo_profile = current_user.ngo_profile
    if not ngo_profile or ngo_profile.verification_status != 'Approved':
        return jsonify({'message': 'Unauthorized: NGO profile must be Approved by Admin'}), 403
        
    data = request.json
    if not data or not data.get('donation_id'):
        return jsonify({'message': 'Missing donation_id'}), 400
        
    donation_id = data.get('donation_id')
    donation = Donation.query.get_or_404(donation_id)
    
    if donation.status != 'Available':
        return jsonify({'message': 'Donation is already claimed, picked up, or cancelled'}), 400
        
    try:
        # Lock donation status
        donation.status = 'Claimed'
        
        # Create PickupRequest
        new_pickup = PickupRequest(
            donation_id=donation_id,
            ngo_id=ngo_profile.ngo_id,
            pickup_status='Requested',
            pickup_time=datetime.datetime.utcnow() + datetime.timedelta(hours=2) # default ETA 2 hours
        )
        db.session.add(new_pickup)
        db.session.commit()
        return jsonify({'message': 'Donation claimed successfully', 'pickup': new_pickup.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Claim failed', 'error': str(e)}), 500


@app.route('/api/pickups/<int:request_id>/status', methods=['PUT'])
@token_required
def update_pickup_status(current_user, request_id):
    pickup = PickupRequest.query.get_or_404(request_id)
    ngo_profile = current_user.ngo_profile
    
    # Check authorization: Only the claiming NGO or Admin can update status
    if current_user.role != 'Admin' and (not ngo_profile or pickup.ngo_id != ngo_profile.ngo_id):
        return jsonify({'message': 'Forbidden: You do not manage this dispatch'}), 403
        
    data = request.json
    new_status = data.get('pickup_status')
    if new_status not in ['Requested', 'In Transit', 'Delivered', 'Cancelled']:
        return jsonify({'message': 'Invalid status'}), 400
        
    try:
        pickup.pickup_status = new_status
        if new_status == 'Delivered':
            pickup.donation.status = 'Picked Up'
        elif new_status == 'Cancelled':
            pickup.donation.status = 'Available'
            
        db.session.commit()
        return jsonify({'message': 'Logistics status updated', 'pickup': pickup.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Update failed', 'error': str(e)}), 500


# --- ADMIN CONTROL PANEL ROUTES ---

@app.route('/api/admin/ngos/pending', methods=['GET'])
@token_required
def get_pending_ngos(current_user):
    if current_user.role != 'Admin':
        return jsonify({'message': 'Unauthorized: Admin access required'}), 403
        
    pending_ngos = NGO.query.filter_by(verification_status='Pending').all()
    # Fetch mapped user account details for each
    results = []
    for ngo in pending_ngos:
        ngo_dict = ngo.to_dict()
        ngo_dict['user_email'] = ngo.user.email if ngo.user else 'No Email'
        ngo_dict['user_name'] = ngo.user.name if ngo.user else 'No Name'
        results.append(ngo_dict)
        
    return jsonify(results), 200


@app.route('/api/admin/ngos/<int:ngo_id>/verify', methods=['PUT'])
@token_required
def verify_ngo(current_user, ngo_id):
    if current_user.role != 'Admin':
        return jsonify({'message': 'Unauthorized: Admin access required'}), 403
        
    data = request.json
    status = data.get('verification_status')
    if status not in ['Approved', 'Rejected']:
        return jsonify({'message': 'Invalid verification status'}), 400
        
    ngo = NGO.query.get_or_404(ngo_id)
    try:
        ngo.verification_status = status
        db.session.commit()
        return jsonify({'message': f'NGO profile verification updated to {status}'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Verification toggle failed', 'error': str(e)}), 500


# --- FEEDBACKS & REVIEW ROUTES ---

@app.route('/api/feedback', methods=['POST'])
@token_required
def submit_feedback(current_user):
    data = request.json
    if not data or not data.get('donation_id') or not data.get('rating'):
        return jsonify({'message': 'Missing parameters'}), 400
        
    donation_id = data.get('donation_id')
    donation = Donation.query.get_or_404(donation_id)
    
    # Establish target user mapping (if donor provides feedback -> targets NGO, and vice versa)
    if current_user.role == 'Donor':
        # Find claim pickup details
        active_pickup = PickupRequest.query.filter_by(donation_id=donation_id).filter(PickupRequest.pickup_status == 'Delivered').first()
        if not active_pickup:
            return jsonify({'message': 'No completed pickup found to review'}), 400
        to_user_id = active_pickup.ngo.user_id
    elif current_user.role == 'NGO':
        to_user_id = donation.donor_id
    else:
        return jsonify({'message': 'Admins cannot review transactions'}), 403
        
    try:
        new_feedback = Feedback(
            donation_id=donation_id,
            from_user_id=current_user.id,
            to_user_id=to_user_id,
            rating=int(data.get('rating')),
            comment=data.get('comment', '')
        )
        db.session.add(new_feedback)
        db.session.commit()
        return jsonify({'message': 'Feedback log created', 'feedback': new_feedback.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Feedback submission failed', 'error': str(e)}), 500


@app.route('/api/feedback', methods=['GET'])
def get_feedbacks():
    feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).limit(20).all()
    # Add names
    results = []
    for f in feedbacks:
        d = f.to_dict()
        user_from = User.query.get(f.from_user_id)
        user_to = User.query.get(f.to_user_id)
        d['from_user_name'] = user_from.name if user_from else 'System'
        d['to_user_name'] = user_to.name if user_to else 'System'
        results.append(d)
    return jsonify(results), 200


# --- DYNAMIC IMPACT STATISTICS ---

@app.route('/api/stats', methods=['GET'])
def get_stats():
    # Calculates totals
    total_donations = Donation.query.count()
    
    # Food saved (where donation status is Picked Up)
    food_saved = db.session.query(db.func.sum(Donation.quantity)).filter(Donation.status == 'Picked Up').scalar() or 0
    
    # Active Listings
    active_listings = Donation.query.filter_by(status='Available').count()
    
    # Verified NGOs
    ngos_count = NGO.query.filter_by(verification_status='Approved').count()
    
    return jsonify({
        'total_donations': total_donations,
        'food_saved_kg': float(food_saved),
        'active_listings': active_listings,
        'ngos_connected': ngos_count
    }), 200


if __name__ == '__main__':
    # Hackathon local debugging settings
    app.run(host='0.0.0.0', port=5000, debug=True)
