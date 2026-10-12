# Demo script (about 8 minutes)

Run `npm run seed` first so the demo data is fresh. Have two browser windows ready (one traveler, one admin).

## 1. The idea (30 seconds)
"Where to Eat? helps travelers find restaurants in four Pampanga towns, book a table, and read honest reviews.
Owners list their places, admins approve them."

## 2. Traveler finds a restaurant
1. Open the landing page. Search "sisig", then filter by town and price.
2. Point out: ratings and "New" labels come from the server, not typed in.
3. Turn on a walking-distance filter (near me) and show the walk minutes on the cards.
4. Open a restaurant. Show the "Open now" badge, the opening hours, and the approved reviews with the rating breakdown.

## 3. Reviews and approval (the part to explain in detail)
1. As **traveler1**, click **Write a review** on a restaurant with no reviews.
2. **Validation error:** press Submit empty. Show the error under each field. Type a 5-character comment and show the message again.
3. Fill it in properly and submit. Show the success message on **My reviews** and the **pending** badge.
4. Open the restaurant page: the new review is **not** there yet and the rating did not change.
5. Switch to **admin**, open **Review moderation**, approve the review.
6. Refresh the restaurant page: the review appears and the rating and review count updated.
7. Reject another pending review and show it appears as **rejected** in the traveler's My reviews, with the option to edit and resend.
8. **Explain the flow:** React form (Zod) -> axios -> `POST /reviews` -> Mongoose validation -> saved as pending -> admin `PATCH /reviews/:id/status` -> `updateRestaurantRating` averages only approved reviews and saves rating and review count on the restaurant.

## 4. Not-found and error cases
1. Open `/restaurants/000000000000000000000000`: a clean "Restaurant not found" message with a way back.
2. Open `/does-not-exist`: the 404 page.
3. In Postman: `GET /reviews/abc` returns 400 "Invalid ID", `GET /reviews/<valid but missing id>` returns 404 "Review not found", and `POST /reviews` without a token returns 401.
4. Stop the server briefly and reload My reviews to show the error state with **Try again**.

## 5. Booking and owner (hand-off to teammates)
- Book a table, show seats left shrinking, and try an overbooked party size.
- As **owner1**, confirm and decline bookings. As admin, approve a pending restaurant.

## 6. Wrap up
Show the commit history with everyone's commits, and that the page works at 375 px wide.

## Questions to be ready for
- **Why is the rating not stored by the traveler?** So it cannot be faked. It is computed from approved reviews.
- **What happens when someone edits an approved review?** It goes back to pending and stops counting until re-approved, and the rating is recalculated.
- **Why is the review route `/restaurants/:id/reviews` in a separate router?** It belongs to the review feature but lives under the restaurant URL; it is mounted with one line in `app.js`.
- **What stops a traveler from approving their own review?** `PATCH /reviews/:id/status` needs the admin role (`protect` then `requireRole('admin')`), and `POST` ignores any `status` in the body.
- **What stops duplicate reviews?** A unique index on restaurant and user, plus a friendly check in the route.
