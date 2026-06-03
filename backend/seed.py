from app import app
from models import db, User, NGO, Donation, Feedback, PickupRequest
import datetime

def seed_database():
    print("Initializing database creation...")
    db.create_all()
    print("Database tables created.")

    # Check if we already have users
    if User.query.first():
        print("Database already seeded. Skipping...")
        return

    print("Seeding initial database entries...")
    
    # 1. Create Users
    # Donor 1
    u_donor1 = User(name="La Piazza Restaurant", email="donor@lapiazza.com", phone="+1 555-0199", role="Donor")
    u_donor1.set_password("password")
    
    # Donor 2
    u_donor2 = User(name="Green Valley Hotel", email="hotel@greenvalley.com", phone="+1 555-0211", role="Donor")
    u_donor2.set_password("password")
    
    # NGO 1
    u_ngo1 = User(name="Sarah Jenkins", email="ngo@savefood.org", phone="+1 555-0188", role="NGO")
    u_ngo1.set_password("password")
    
    # NGO 2 (Pending approval)
    u_ngo2 = User(name="David Miller", email="ngo@hopemission.org", phone="+1 555-0133", role="NGO")
    u_ngo2.set_password("password")
    
    # Admin
    u_admin = User(name="Super Admin", email="admin@ecofeed.com", phone="+1 555-0100", role="Admin")
    u_admin.set_password("password")

    db.session.add_all([u_donor1, u_donor2, u_ngo1, u_ngo2, u_admin])
    db.session.commit()
    print("Users seeded.")

    # 2. Create NGO details
    ngo1_details = NGO(
        user_id=u_ngo1.id,
        organization_name="Save Food Foundation",
        address="742 Evergreen Terrace, Springfield",
        contact_number="+1 555-0188",
        verification_status="Approved"
    )
    ngo2_details = NGO(
        user_id=u_ngo2.id,
        organization_name="Hope Mission Charity",
        address="123 Main St, Springfield",
        contact_number="+1 555-0133",
        verification_status="Pending"
    )
    db.session.add_all([ngo1_details, ngo2_details])
    db.session.commit()
    print("NGO details seeded.")

    # 3. Create Donations
    d1 = Donation(
        donor_id=u_donor1.id,
        food_name="Fresh Baked Lasagna & Garlic Bread",
        quantity=25,
        food_type="Veg",
        expiry_time=datetime.datetime.utcnow() + datetime.timedelta(hours=6),
        pickup_address="456 Italian Way, Food District",
        image_url="https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=600",
        status="Available"
    )
    
    d2 = Donation(
        donor_id=u_donor2.id,
        food_name="Mixed Dinner Buffet Items",
        quantity=60,
        food_type="Non-Veg",
        expiry_time=datetime.datetime.utcnow() + datetime.timedelta(hours=4),
        pickup_address="88 Luxury Blvd, Uptown",
        image_url="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600",
        status="Claimed"
    )
    
    d3 = Donation(
        donor_id=u_donor1.id,
        food_name="Assorted Breakfast Pastries",
        quantity=15,
        food_type="Bakery",
        expiry_time=datetime.datetime.utcnow() - datetime.timedelta(hours=4), # Expired/past
        pickup_address="456 Italian Way, Food District",
        image_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
        status="Picked Up"
    )

    d4 = Donation(
        donor_id=u_donor2.id,
        food_name="Fresh Fruit Salad Platters",
        quantity=30,
        food_type="Veg",
        expiry_time=datetime.datetime.utcnow() + datetime.timedelta(hours=8),
        pickup_address="88 Luxury Blvd, Uptown",
        image_url="https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&q=80&w=600",
        status="Available"
    )

    db.session.add_all([d1, d2, d3, d4])
    db.session.commit()
    print("Donations seeded.")

    # 4. Create Pickup Requests
    pr1 = PickupRequest(
        donation_id=d2.donation_id,
        ngo_id=ngo1_details.ngo_id,
        pickup_status="Requested",
        pickup_time=datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    )
    
    pr2 = PickupRequest(
        donation_id=d3.donation_id,
        ngo_id=ngo1_details.ngo_id,
        pickup_status="Delivered",
        pickup_time=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
    )

    db.session.add_all([pr1, pr2])
    db.session.commit()
    print("Pickup requests seeded.")

    # 5. Create Feedback
    f1 = Feedback(
        donation_id=d3.donation_id,
        from_user_id=u_donor1.id,
        to_user_id=u_ngo1.id,
        rating=5,
        comment="Punctual collection, polite volunteers!"
    )
    
    f2 = Feedback(
        donation_id=d3.donation_id,
        from_user_id=u_ngo1.id,
        to_user_id=u_donor1.id,
        rating=5,
        comment="Quality of pastries was excellent. Kept cold during transport."
    )

    db.session.add_all([f1, f2])
    db.session.commit()
    print("Feedbacks seeded.")
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    with app.app_context():
        seed_database()
