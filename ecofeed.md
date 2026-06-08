# Food Waste Management Platform

## Project Title

**Food Waste Management Platform: A Smart Solution for Reducing Food Wastage and Supporting Hunger Relief**

---

## Problem Statement

Food wastage is a major issue in today's society. Restaurants, hotels, hostels, canteens, supermarkets, and event organizers often dispose of surplus edible food, while many people struggle to access adequate meals. The lack of an efficient system to connect food donors with NGOs and food recipients leads to unnecessary waste. This project aims to provide a centralized platform that enables food donation, collection, and distribution in a timely and efficient manner.

---

## Project Objectives

1. Reduce food wastage by encouraging the donation of surplus food.
2. Connect food donors with NGOs and charitable organizations.
3. Facilitate quick and efficient food collection and distribution.
4. Maintain records of food donations and beneficiaries.
5. Improve transparency and accountability in food distribution.
6. Promote social responsibility and community welfare.

---

## Module List

### 1. User Management Module

* User Registration
* User Login
* Profile Management

### 2. Food Donation Module

* Add Food Details
* Specify Quantity and Expiry Time
* Update Donation Status

### 3. NGO Management Module

* NGO Registration
* View Available Donations
* Accept Donation Requests

### 4. Food Collection & Distribution Module

* Schedule Food Pickup
* Track Distribution Status
* Confirm Delivery

### 5. Notification Module

* Donation Alerts
* Pickup Notifications
* Status Updates

### 6. Admin Module

* Manage Users
* Manage NGOs
* Monitor Donations
* Generate Reports

---

## Database Table List

### Users

| Field Name | Data Type |
| ---------- | --------- |
| user_id    | INT       |
| name       | VARCHAR   |
| email      | VARCHAR   |
| password   | VARCHAR   |
| phone      | VARCHAR   |
| role       | VARCHAR   |

### Food_Donations

| Field Name  | Data Type |
| ----------- | --------- |
| donation_id | INT       |
| donor_id    | INT       |
| food_name   | VARCHAR   |
| quantity    | VARCHAR   |
| expiry_time | DATETIME  |
| location    | VARCHAR   |
| status      | VARCHAR   |

### NGOs

| Field Name     | Data Type |
| -------------- | --------- |
| ngo_id         | INT       |
| ngo_name       | VARCHAR   |
| contact_person | VARCHAR   |
| phone          | VARCHAR   |
| address        | TEXT      |

### Food_Requests

| Field Name     | Data Type |
| -------------- | --------- |
| request_id     | INT       |
| ngo_id         | INT       |
| donation_id    | INT       |
| request_status | VARCHAR   |

### Distribution

| Field Name       | Data Type |
| ---------------- | --------- |
| distribution_id  | INT       |
| donation_id      | INT       |
| ngo_id           | INT       |
| distributed_date | DATE      |
| status           | VARCHAR   |

### Notifications

| Field Name      | Data Type |
| --------------- | --------- |
| notification_id | INT       |
| user_id         | INT       |
| message         | TEXT      |
| created_at      | DATETIME  |

### Feedback

| Field Name  | Data Type |
| ----------- | --------- |
| feedback_id | INT       |
| user_id     | INT       |
| comments    | TEXT      |
| rating      | INT       |

---

## Expected Outcome

The Food Waste Management Platform will help reduce food wastage by creating a bridge between food donors and NGOs. The system ensures that surplus food is distributed efficiently to people in need, contributing to hunger reduction and sustainable food management.
