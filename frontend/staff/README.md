# MediEase Queue

the first 2 images are web pages and the next 2 images are popups when we press pause queue and emergency
build me the complete workable webpage with all the edge cases

Build a hospital staff queue management app called MediEase, based on the 4 attached screens plus 2 popups (6 images total).

Pages 1 (staff auth flow, 4 screens):

1. Staff Login: Staff ID field, Password field with show/hide toggle, Forgot Password link, Login button, "New to MediEase? Sign Up" link.

2. Staff Registration: Full Name, Mobile Number (+91), Role dropdown, Password, Confirm Password fields, security note about hospital authorization, Create Account button, "Already have an account? Login here" link.

3. Verify Mobile Number: OTP sent to the entered mobile number, 6-digit OTP input boxes, "Verify & Create Account" button, Resend OTP link, "Change mobile number" link.

4. Account Created Successfully: success confirmation, generated Staff ID shown, "Go to Staff Login" button, "Contact Support" link.

Pages 2 (doctor/queue flow, 2 screens):

5. Select Doctor: list of doctors with name, specialty, room, hours, status (Consultation Active / Not Started / Unavailable), appointment count, and a "Select Doctor" button per doctor (disabled when unavailable).

6. Today's Patient Queue: shows selected doctor info with "Change Doctor" link, currently-in-consultation patient card with Start/Skip Patient actions, next patient card, full today's queue list with statuses (in progress/waiting/completed), queue summary stats (total, in consultation, waiting, completed, estimated wait), and staff controls: Emergency, Pause Queue, Resume Queue, Manage Exceptions buttons.

Popups:

7. Pause Queue popup (triggered from the Pause Queue button): title "Pause Queue" with close icon, "Select reason for pausing the queue" with selectable reason options (Doctor Unavailable, Break, Emergency, Tech Issue, Other), Cancel and Confirm buttons.

8. New Emergency popup (triggered from the Emergency button): title "New Emergency" with warning icon and close icon, fields for Patient Name, ID/Phone, Reason (text area), Priority dropdown (e.g. Critical), Cancel and "Add to Queue" buttons.

All buttons and interactions across these screens need to actually work end to end (navigation between screens, form validation, OTP flow, doctor selection persisting into the queue screen, starting/skipping/pausing/resuming the queue, adding an emergency patient into the queue, etc.), including sensible handling of edge cases like empty/invalid inputs, wrong OTP, no doctors available, empty queue, and duplicate submissions.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7f141fb3-8f32-4da7-a183-c085139c8771).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
