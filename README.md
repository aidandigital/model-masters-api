# Model Masters

## Description
A custom platform for car and vehicle model enthusiasts to share their creations. Users can log in or register for an account in order to view posts made by other users in a fashion similar to social media sites. Verified users can publish their models along with photos, a description, and more.

## Tech used
### Backend:
* Node.js®
* Express.js
* MongoDB®
* Passport.js
* Mongoose
* AWS S3
### Frontend:
* React
* React Router
* AJAX / API Consumption
* Tailwind CSS

## Features
### Backend:
* HTTP API
* Authentication functionality that hashes passwords with a salt for added security.
* Authorization logic based on multiple tiers of abilities users can have.
* Database schemas, controllers, and aggregation pipelines for CRUD operations.
* Form validation and sanitation with helpful error messages that are passed on to users.
* Functionality for securely requesting and generating signed URL's that allow users to seamlessly upload, alter, and delete photos of their models.
### Frontend:
* Login / Register UI, with the ability to log back in on any page without losing progress on said page.
* A settings page where users can update their profile, change their password, and view a full login history.
* An advanced image upload component that allows users to add, preview, prioritize, and delete photos of their models. Photos are automatically compressed, stripped of privacy-invading EXIF data, and securely uploaded.
* User and model search pages, in addition to individual profiles and posts that employ custom lazy-loaded image carousels for appeal and optimized performance.
* Admin dashboard that allows authorized users to upgrade/demote the privileges of other users as well as approve/lock accounts.
* Error reporting and content flagging features to make the site safer and more reliable.
* Personalized headers and pages based on user permissions.

## Frontend Code
Repo: https://github.com/aidandigital/model-masters-client