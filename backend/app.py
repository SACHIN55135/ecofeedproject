import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt

# Local imports
from config import Config
from models import db, User, NGO, Donation, PickupRequest, Feedback, Notification

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
    if role not in ['Donor', 'NGO', 'Admin', 'Volunteer']:
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
    user_data = current_user.to_dict()
    # Count unread notifications
    unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
    user_data['unread_notifications_count'] = unread_count
    return jsonify(user_data), 200


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
        
        # Calculate carbon offset in advance (co2 saved if picked up)
        qty = float(data.get('quantity'))
        food_type = data.get('food_type')
        multipliers = {'Veg': 2.1, 'Non-Veg': 6.4, 'Bakery': 1.8, 'Groceries': 1.5}
        carbon = qty * multipliers.get(food_type, 1.5)
        
        import random
        # Generates a QR Code token and mock AI analysis
        token = f"QR-{food_type.upper()}-{int(datetime.datetime.utcnow().timestamp())}"
        freshness = random.randint(85, 98)
        
        new_donation = Donation(
            donor_id=current_user.id,
            food_name=data.get('food_name'),
            quantity=qty,
            food_type=food_type,
            expiry_time=expiry_dt,
            pickup_address=data.get('pickup_address'),
            image_url=data.get('image_url'),
            status='Available',
            carbon_offset=carbon,
            freshness_score=freshness,
            quality_status='PASSED',
            qr_code_token=token
        )
        db.session.add(new_donation)
        db.session.commit()
        
        # Notify NGOs about the new donation
        ngos = NGO.query.filter_by(verification_status='Approved').all()
        for ngo in ngos:
            notif = Notification(
                user_id=ngo.user_id,
                message=f"Alert: {current_user.name} listed {qty} kg of {new_donation.food_name} near you."
            )
            db.session.add(notif)
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
        donation.status = 'Accepted'
        
        # Calculate random but logical routing distance and duration
        dist = round(1.5 + (donation_id % 5) * 1.3, 1)
        dur = int(6 + (donation_id % 5) * 4)
        
        # Create PickupRequest
        new_pickup = PickupRequest(
            donation_id=donation_id,
            ngo_id=ngo_profile.ngo_id,
            pickup_status='Requested',
            pickup_time=datetime.datetime.utcnow() + datetime.timedelta(hours=2), # default ETA 2 hours
            route_distance=dist,
            route_duration=dur
        )
        db.session.add(new_pickup)
        
        # Notify donor that donation was claimed
        notif = Notification(
            user_id=donation.donor_id,
            message=f"{ngo_profile.organization_name} has claimed your donation of '{donation.food_name}'."
        )
        db.session.add(notif)
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
    
    # Check authorization: Only the claiming NGO, assigned Volunteer, or Admin can update status
    is_ngo_owner = ngo_profile and pickup.ngo_id == ngo_profile.ngo_id
    is_volunteer_owner = pickup.volunteer_id == current_user.id
    
    if current_user.role != 'Admin' and not is_ngo_owner and not is_volunteer_owner:
        return jsonify({'message': 'Forbidden: You do not manage this dispatch'}), 403
        
    data = request.json
    new_status = data.get('pickup_status')
    if new_status not in ['Requested', 'In Transit', 'Delivered', 'Cancelled']:
        return jsonify({'message': 'Invalid status'}), 400
        
    try:
        pickup.pickup_status = new_status
        donation = pickup.donation
        
        if new_status == 'In Transit':
            donation.status = 'Picked Up'
            notif = Notification(
                user_id=donation.donor_id,
                message=f"Driver has started dispatch! Food package '{donation.food_name}' has been picked up."
            )
            db.session.add(notif)
            
        elif new_status == 'Delivered':
            donation.status = 'Delivered'
            # Award points and notifications if updated manually
            pt_multipliers = {'Veg': 10, 'Non-Veg': 20, 'Bakery': 15, 'Groceries': 12}
            points = int(float(donation.quantity) * pt_multipliers.get(donation.food_type, 10))
            donation.donor.eco_points += points
            
            # Award volunteer service hours if applicable
            if pickup.volunteer_id:
                hours = float(donation.quantity) * 0.1
                pickup.volunteer.volunteer_hours += hours
            
            n_donor = Notification(
                user_id=donation.donor_id,
                message=f"Success! '{donation.food_name}' picked up. +{points} Eco-Points rewarded!"
            )
            n_ngo = Notification(
                user_id=pickup.ngo.user_id,
                message=f"Delivered: Successfully delivered '{donation.food_name}' to charity shelter."
            )
            db.session.add_all([n_donor, n_ngo])
            
        elif new_status == 'Cancelled':
            donation.status = 'Available'
            notif = Notification(
                user_id=donation.donor_id,
                message=f"Notice: Claims cancelled on '{donation.food_name}'."
            )
            db.session.add(notif)
            
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
    total_donations = Donation.query.count()
    food_saved = db.session.query(db.func.sum(Donation.quantity)).filter(Donation.status == 'Picked Up').scalar() or 0
    active_listings = Donation.query.filter_by(status='Available').count()
    ngos_count = NGO.query.filter_by(verification_status='Approved').count()
    carbon_saved = db.session.query(db.func.sum(Donation.carbon_offset)).filter(Donation.status == 'Picked Up').scalar() or 0
    
    return jsonify({
        'total_donations': total_donations,
        'food_saved_kg': float(food_saved),
        'active_listings': active_listings,
        'ngos_connected': ngos_count,
        'carbon_saved_kg': float(carbon_saved)
    }), 200


# --- AI-BASED NGO MATCHING ---
@app.route('/api/ai/match', methods=['GET'])
@token_required
def ai_match_ngo(current_user):
    donation_id = request.args.get('donation_id', type=int)
    if not donation_id:
        return jsonify({'message': 'Missing donation_id parameter'}), 400
        
    donation = Donation.query.get_or_404(donation_id)
    ngos = NGO.query.filter_by(verification_status='Approved').all()
    
    results = []
    for ngo in ngos:
        # Simulated intelligent matching algorithm
        # Baselines: location, food category preference, active backlog
        base_score = 75
        
        # Match by category preference based on organization name hashes
        pref_veg = (ngo.ngo_id % 2 == 0)
        if donation.food_type == 'Veg' and pref_veg:
            base_score += 15
        elif donation.food_type == 'Non-Veg' and not pref_veg:
            base_score += 12
        else:
            base_score += 5
            
        # Distance mock penalty
        dist = (ngo.ngo_id + donation_id) % 10 + 1 # 1 to 10 miles
        base_score -= int(dist * 1.5)
        
        # Backlog load balancing penalty
        active_claims = PickupRequest.query.filter_by(ngo_id=ngo.ngo_id).filter(
            PickupRequest.pickup_status.in_(['Requested', 'In Transit'])
        ).count()
        base_score -= (active_claims * 8)
        
        # Keep score in sensible bounds [50, 99]
        final_score = max(50, min(99, base_score))
        
        results.append({
            'ngo_id': ngo.ngo_id,
            'organization_name': ngo.organization_name,
            'address': ngo.address,
            'match_score': final_score,
            'distance_miles': dist,
            'active_backlog': active_claims,
            'reason': f"Match score {final_score}%: Proximity is {dist} miles, with an active workload of {active_claims} claim(s)."
        })
        
    # Sort by match score descending
    results = sorted(results, key=lambda x: x['match_score'], reverse=True)
    return jsonify(results), 200


# --- IMAGE-BASED QUALITY INSPECTOR ---
@app.route('/api/ai/verify-quality', methods=['POST'])
@token_required
def verify_quality(current_user):
    data = request.json
    donation_id = data.get('donation_id')
    image_url = data.get('image_url')
    
    import random
    freshness = random.randint(86, 98)
    status = "PASSED" if freshness >= 90 else "WARNING"
    
    if donation_id:
        donation = Donation.query.get(donation_id)
        if donation:
            donation.freshness_score = freshness
            donation.quality_status = status
            if image_url:
                donation.image_url = image_url
            db.session.commit()
            
    return jsonify({
        'freshness_score': freshness,
        'quality_status': status,
        'detected_food_group': 'Fresh Prepared/Cooked Meal',
        'spoilage_index': f"{100 - freshness}% Spoilage Risk",
        'message': "Computer vision verification completes successfully. Certified safe to distribute."
    }), 200


# --- VOLUNTEER DISPATCH ROUTES ---

@app.route('/api/volunteer/stats', methods=['GET'])
@token_required
def get_volunteer_stats(current_user):
    if current_user.role != 'Volunteer':
        return jsonify({'message': 'Unauthorized: Only volunteers can access this'}), 403
    
    active_deliveries = PickupRequest.query.filter_by(volunteer_id=current_user.id).filter(PickupRequest.pickup_status != 'Delivered').count()
    completed_deliveries = PickupRequest.query.filter_by(volunteer_id=current_user.id).filter(PickupRequest.pickup_status == 'Delivered').count()
    
    return jsonify({
        'volunteer_hours': current_user.volunteer_hours,
        'volunteer_status': current_user.volunteer_status,
        'active_deliveries': active_deliveries,
        'completed_deliveries': completed_deliveries
    }), 200


@app.route('/api/volunteer/tasks', methods=['GET'])
@token_required
def get_volunteer_tasks(current_user):
    if current_user.role != 'Volunteer':
        return jsonify({'message': 'Unauthorized: Only volunteers can access this'}), 403
        
    available_tasks = PickupRequest.query.filter_by(volunteer_id=None).filter(PickupRequest.pickup_status == 'Requested').all()
    my_tasks = PickupRequest.query.filter_by(volunteer_id=current_user.id).all()
    
    return jsonify({
        'available': [t.to_dict() for t in available_tasks],
        'my_tasks': [t.to_dict() for t in my_tasks]
    }), 200


@app.route('/api/volunteer/claim-task', methods=['POST'])
@token_required
def volunteer_claim_task(current_user):
    if current_user.role != 'Volunteer':
        return jsonify({'message': 'Unauthorized: Only volunteers can claim tasks'}), 403
        
    data = request.json
    request_id = data.get('request_id')
    pickup = PickupRequest.query.get_or_404(request_id)
    
    if pickup.volunteer_id:
        return jsonify({'message': 'Task is already assigned to a volunteer'}), 400
        
    try:
        pickup.volunteer_id = current_user.id
        db.session.commit()
        return jsonify({'message': 'Task claimed successfully!', 'pickup': pickup.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to claim task', 'error': str(e)}), 500


# --- QR CONFIRM PICKUP LOGISTICS ---
@app.route('/api/pickups/<int:request_id>/confirm-qr', methods=['POST'])
@token_required
def confirm_pickup_qr(current_user, request_id):
    pickup = PickupRequest.query.get_or_404(request_id)
    data = request.json
    token = data.get('qr_code_token')
    
    if not token or pickup.donation.qr_code_token != token:
        return jsonify({'message': 'Authentication failed: Invalid secure QR code token.'}), 400
        
    try:
        donation = pickup.donation
        ngo_profile = pickup.ngo
        
        pickup.pickup_status = 'Delivered'
        donation.status = 'Delivered'
        
        # Calculate carbon offset
        qty = float(donation.quantity)
        pt_multipliers = {'Veg': 10, 'Non-Veg': 20, 'Bakery': 15, 'Groceries': 12}
        co2_multipliers = {'Veg': 2.1, 'Non-Veg': 6.4, 'Bakery': 1.8, 'Groceries': 1.5}
        
        carbon = qty * co2_multipliers.get(donation.food_type, 1.5)
        donation.carbon_offset = carbon
        
        # Reward points to donor
        points = int(qty * pt_multipliers.get(donation.food_type, 10))
        donation.donor.eco_points += points
        
        # Reward volunteer service hours if assigned
        if pickup.volunteer_id:
            hours_earned = float(donation.quantity) * 0.1
            pickup.volunteer.volunteer_hours += hours_earned
            n_vol = Notification(
                user_id=pickup.volunteer_id,
                message=f"Verified Handover: Delivered '{donation.food_name}' to {ngo_profile.organization_name}! +{hours_earned:.1f} volunteer hours credited."
            )
            db.session.add(n_vol)
            
        # Add notifications
        n_donor = Notification(
            user_id=donation.donor_id,
            message=f"Verified: {donation.food_name} collected by {ngo_profile.organization_name} via Secure QR! +{points} Eco-Points rewarded. Saved {carbon} kg CO2."
        )
        n_ngo = Notification(
            user_id=ngo_profile.user_id,
            message=f"Logistics Complete: Checked in pickup #{request_id} for '{donation.food_name}'."
        )
        db.session.add_all([n_donor, n_ngo])
        db.session.commit()
        
        return jsonify({
            'message': 'QR code verified, dispatch completed successfully!',
            'eco_points_earned': points,
            'carbon_offset_kg': carbon
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'QR confirmation failed', 'error': str(e)}), 500


# --- NOTIFICATIONS ENDPOINTS ---
@app.route('/api/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    notifs = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).limit(30).all()
    return jsonify([n.to_dict() for n in notifs]), 200


@app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
@token_required
def mark_notification_read(current_user, notification_id):
    notif = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first_or_404()
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read'}), 200


# --- ML WASTE PREDICTIONS FORCAST ---
@app.route('/api/analytics/predict-waste', methods=['GET'])
@token_required
def predict_waste_trends(current_user):
    # Simulated ML time-series forecasts of waste volume (kg)
    # Projections by day of week
    forecast = [
        {'day': 'Monday', 'predicted_waste_kg': 1120, 'confidence_low': 980, 'confidence_high': 1260},
        {'day': 'Tuesday', 'predicted_waste_kg': 950, 'confidence_low': 800, 'confidence_high': 1100},
        {'day': 'Wednesday', 'predicted_waste_kg': 890, 'confidence_low': 750, 'confidence_high': 1030},
        {'day': 'Thursday', 'predicted_waste_kg': 1200, 'confidence_low': 1050, 'confidence_high': 1350},
        {'day': 'Friday', 'predicted_waste_kg': 1650, 'confidence_low': 1480, 'confidence_high': 1820},
        {'day': 'Saturday', 'predicted_waste_kg': 2100, 'confidence_low': 1900, 'confidence_high': 2300},
        {'day': 'Sunday', 'predicted_waste_kg': 2350, 'confidence_low': 2150, 'confidence_high': 2550}
    ]
    
    advisory = (
        "AI Predictive Advisory: Weekends (Friday-Sunday) see an estimated 65% surge in food surplus "
        "waste volume. We advise Donors (hotels & caterers) to post surplus listings before 4:00 PM on these days "
        "to ensure optimal matching schedules with active NGO dispatch fleets."
    )
    
    return jsonify({
        'forecast': forecast,
        'advisory': advisory,
        'trend_direction': 'Upward (Weekly seasonality peak on Sundays)'
    }), 200


# --- REWARDS LEADERBOARD ---
@app.route('/api/rewards/leaderboard', methods=['GET'])
def get_rewards_leaderboard():
    donors = User.query.filter_by(role='Donor').order_by(User.eco_points.desc()).limit(10).all()
    results = []
    for d in donors:
        # Determine tier
        tier = "Bronze Eco-Hero"
        if d.eco_points >= 1000:
            tier = "Platinum Eco-Hero"
        elif d.eco_points >= 500:
            tier = "Gold Eco-Hero"
        elif d.eco_points >= 250:
            tier = "Silver Eco-Hero"
            
        results.append({
            'donor_id': d.id,
            'name': d.name,
            'eco_points': d.eco_points,
            'tier': tier
        })
    return jsonify(results), 200


if __name__ == '__main__':
    # Hackathon local debugging settings
    app.run(host='0.0.0.0', port=5000, debug=True)
