# Model Masters

## Description
A custom platform for car and vehicle model enthusiasts to share their creations. Users can sign up, or log in as a guest in order to view posts made by other users in a fashion similar to social media sites. Verified users can publish their models along with up to 10 photos, a description, and more.

## Tech used
### Backend:
* Node.js®
* Express.js
* MongoDB®
* Passport.js
* Mongoose
* Cloudinary
* Multer
### Frontend:
* React
* React Router
* AJAX / API Consumption
* Tailwind CSS

## Features
### Backend:
* HTTP API
* Authentication and Authorization
* Database schemas, controllers, and aggregation pipelines for CRUD operations.
* Form validation and NoSQL injection sanitation with helpful error messages for users.
* File upload middleware that supports multiple images at once, validates for type and mimetype, and interprets/validates JSON data attached to the same request. Valid files are then transferred automatically from the local FS to Cloudinary.
### Frontend:
* Login / Register UI, with the ability to log back in on any page without losing progress on said page.
* Settings page where users can update their profile, change their password, and view a full login history.
* Complex image upload component that allows users to add, preview, and delete up to 8 images. Also automatically converts HEIC images to JPEG.
* Admin dashboard that allows authorized users to upgrade, demote, and lock accounts.
* Personalized Header and Pages based on user permissions.

## Frontend Code
Repo: https://github.com/aidandigital/model-masters-client