# Collection Tracker API
API Repository for Joseph Mitchell's M137CEM Coursework Submission. 

## Live Project
https://mitch137-ct-api.herokuapp.com/


## Description

This project is the RESTful API component for a system designed for the module M137CEM at Coventry University (2021). The purpose of the application is to allow the user access and control over several collections. Versioning has been implemented such that each version is completely independent of one another (based on the micro-service architecture). The API is self-documenting using a HATEOS format.

## Completed Tasks

### Stage 1 [complete]

The first part of the project is to build a system that records parcels being dispatched.

#### Part 1 [complete]

Users need to be logged in to access any functionality. There should be a **Send parcel** button on the _Homepage_. This takes the user to a screen where they enter the details of the parcel they want to send. They need to provide the following information:

1. The sender's postcode.
2. The destination postcode.
3. A slider to select the parcel weight in Kg, max 20Kg.
4. The name of the recipient.
5. A multiline textbox to enter the full address.

When the parcel is added, the following extra information needs to be stored in the database (without prompting the user for it).

1. The username of the person sending the parcel.
2. The date and time the parcel was added.
3. The parcel status (set this to `not-dispatched`.
4. A unique tracking number (letters an numbers).

#### Part 2 [complete]

The _Homepage_ should list the packages added by the logged-in user. This should include:

1. The name of the recipient.
2. The destination postcode.
3. The date and time added.
4. The parcel status.

#### Part 3 [complete]

Now the courier logs in. On their _homepage_ they see a textbox where they enter the tracking number for a parcel. This needs to match a parcel that has the status of `not-dispatched` or it throws and error and asks for the tracking number again.

If it finds a match it changes the status of the parcel to be `in-transit`. This status should be reflected on the homescreen of the person sending the parcel.

The parcel details now appear on the courier's homepage but only for the parcels he has entered a valid tracking number. Each parcel on this page has been accepted by that particular courier and not yet delivered. For each parcel they should see the following:

1. The name of the recipient.
2. The destination postcode.
3. The weight of the parcel in Kg.
4. How many hours have elapsed since the parcel was added to the system.

### Stage 2 [complete]

Now lets complete the delivery process.

When the courier arrives at the destination address they scan the parcel (enter the tracking number into the box on the _Homepage_ again). If the tracking number matches an item on the homescreen the courier is taken to the _Delivery Screen_ where they enter:

1. The name of the person accepting the parcel.
2. An uploaded signature from the recipient.

In addition to the data entered by the courier, the system should automatically capture and store:

1. The current date and time.
2. The current location (longitude and latitude).
3. The parcel status should now be changed to `delivered` which means this should be flagged up on the homepage of the person posting the item.

---

 ### Stage 3 [complete]
 
 You are required to build a series of tracking pages so that:
 
1. The courier has a list of all the parcels they are yet to deliver, displaying the tracking number, address, postcode and date posted.
2. There should be a manager role who has access to a screen that lists all the couriers with parcels still to deliver, showing the name of courier and the number of parcels still undelivered.
    1. Clicking on one of the couriers should display the list from point 1 for that courier.
3. They should also see a list of the parcels that have not been picked up by the courier with the one posted earliest at the top of the list. Any parcel that has been waiting for longer than 48 hours should be flagged.
 4. They should also see a list of delivered parcels with the most recent delivery at the top. Each should show the tracking number, name, address and postcode.