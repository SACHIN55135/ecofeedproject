import datetime
from flask_sqlalchemy import SQLAlchemy
import bcrypt

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('Donor', 'NGO', 'Admin'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    ngo_profile = db.relationship('NGO', backref='user', uselist=False, cascade="all, delete-orphan")
    donations = db.relationship('Donation', backref='donor', cascade="all, delete-orphan")
    
    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
        
    def to_dict(self):
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if self.role == 'NGO' and self.ngo_profile:
            data['ngo_details'] = self.ngo_profile.to_dict()
        return data


class NGO(db.Model):
    __tablename__ = 'ngos'
    
    ngo_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    organization_name = db.Column(db.String(150), nullable=False)
    address = db.Column(db.Text, nullable=False)
    contact_number = db.Column(db.String(20), nullable=False)
    verification_status = db.Column(db.Enum('Pending', 'Approved', 'Rejected'), default='Pending')
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    pickup_requests = db.relationship('PickupRequest', backref='ngo', cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'ngo_id': self.ngo_id,
            'user_id': self.user_id,
            'organization_name': self.organization_name,
            'address': self.address,
            'contact_number': self.contact_number,
            'verification_status': self.verification_status,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Donation(db.Model):
    __tablename__ = 'donations'
    
    donation_id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    food_name = db.Column(db.String(150), nullable=False)
    quantity = db.Column(db.Numeric(10, 2), nullable=False)
    food_type = db.Column(db.Enum('Veg', 'Non-Veg', 'Bakery', 'Groceries'), nullable=False)
    expiry_time = db.Column(db.DateTime, nullable=False)
    pickup_address = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    status = db.Column(db.Enum('Available', 'Claimed', 'Picked Up', 'Cancelled'), default='Available')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    pickups = db.relationship('PickupRequest', backref='donation', cascade="all, delete-orphan")
    feedbacks = db.relationship('Feedback', backref='donation', cascade="all, delete-orphan")
    
    def to_dict(self):
        # Find active claimed NGO details if any
        claimed_details = None
        active_pickup = PickupRequest.query.filter_by(donation_id=self.donation_id).filter(PickupRequest.pickup_status != 'Cancelled').first()
        if active_pickup:
            claimed_details = {
                'request_id': active_pickup.request_id,
                'ngo_id': active_pickup.ngo_id,
                'ngo_name': active_pickup.ngo.organization_name if active_pickup.ngo else 'Unknown NGO',
                'pickup_status': active_pickup.pickup_status,
                'pickup_time': active_pickup.pickup_time.isoformat() if active_pickup.pickup_time else None
            }
            
        return {
            'donation_id': self.donation_id,
            'donor_id': self.donor_id,
            'donor_name': self.donor.name if self.donor else 'Unknown Donor',
            'food_name': self.food_name,
            'quantity': float(self.quantity),
            'food_type': self.food_type,
            'expiry_time': self.expiry_time.isoformat() if self.expiry_time else None,
            'pickup_address': self.pickup_address,
            'image_url': self.image_url,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'logistics': claimed_details
        }


class PickupRequest(db.Model):
    __tablename__ = 'pickup_requests'
    
    request_id = db.Column(db.Integer, primary_key=True)
    donation_id = db.Column(db.Integer, db.ForeignKey('donations.donation_id', ondelete='CASCADE'), nullable=False)
    ngo_id = db.Column(db.Integer, db.ForeignKey('ngos.ngo_id', ondelete='CASCADE'), nullable=False)
    pickup_status = db.Column(db.Enum('Requested', 'In Transit', 'Delivered', 'Cancelled'), default='Requested')
    pickup_time = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    def to_dict(self):
        return {
            'request_id': self.request_id,
            'donation_id': self.donation_id,
            'ngo_id': self.ngo_id,
            'pickup_status': self.pickup_status,
            'pickup_time': self.pickup_time.isoformat() if self.pickup_time else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'donation_details': self.donation.to_dict() if self.donation else None
        }


class Feedback(db.Model):
    __tablename__ = 'feedbacks'
    
    feedback_id = db.Column(db.Integer, primary_key=True)
    donation_id = db.Column(db.Integer, db.ForeignKey('donations.donation_id', ondelete='CASCADE'), nullable=False)
    from_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    to_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def to_dict(self):
        return {
            'feedback_id': self.feedback_id,
            'donation_id': self.donation_id,
            'rating': self.rating,
            'comment': self.comment,
            'from_user_id': self.from_user_id,
            'from_user_name': self.from_user.name if hasattr(self, 'from_user') and self.from_user else 'Unknown',
            'to_user_id': self.to_user_id,
            'to_user_name': self.to_user.name if hasattr(self, 'to_user') and self.to_user else 'Unknown',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
