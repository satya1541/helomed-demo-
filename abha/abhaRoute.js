const express = require('express');
const router = express.Router();
const AbhaController = require('./abhaController');
const auth = require('../../middleware/authMiddleware');
// auth.authenticateToken

router.use(auth.authenticateUser);

/**
 * @swagger
 * tags:
 *   name: ABHA Milestone 1
 *   description: APIs for ABDM ABHA ID creation and verification process.
 */

/**
 * @swagger
 * /abha/generateAadhaarOtp:
 *   post:
 *     summary: Generate Aadhaar OTP
 *     description: This API generates an OTP on the Aadhaar registered mobile number for ABHA ID enrollment.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginId
 *               - customerId
 *             properties:
 *               loginId:
 *                 type: string
 *                 description: Aadhaar number of the user (12 digit UIDAI Aadhaar number)
 *                 example: "123456789123"
 *                 minLength: 12
 *                 maxLength: 12
 *                 pattern: "^[0-9]{12}$"
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *     responses:
 *       200:
 *         description: OTP generated successfully and sent to Aadhaar linked mobile number
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: response received Successfully
 *               data:
 *                 response:
 *                   txnId: "bbb3be5a-2ca8-451f-beb6-191726070d51"
 *                   message: "OTP sent to Aadhaar registered mobile number ending with ******5708"
 *               timestamp: "2026-03-07T05:18:37.612Z"
 *       400:
 *         description: Invalid Aadhaar Number or missing parameters
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: Invalid Aadhaar Number.
 *               data: null
 *               timestamp: "2026-03-07T06:40:36.992Z"
 *       500:
 *         description: Internal server error
 */
router.post('/generateAadhaarOtp', AbhaController.generateAadhaarOtp);

/**
 * @swagger
 * /abha/verifyAadharOtp:
 *   post:
 *     summary: Verify Aadhaar OTP and fetch ABHA profile
 *     description: >
 *       Verifies the OTP received on Aadhaar registered mobile number and fetches the ABHA profile details.
 *       After verification, check the `mobileVerified` field in the response:
 *
 *       - If `mobileVerified` is **true**, the mobile number is already Aadhaar linked and verified.
 *         You can directly call `POST /getAbhaAddressSuggestion`.
 *
 *       - If `mobileVerified` is **false**, the provided mobile number is different and must be verified
 *         by calling:
 *           1. `POST /generateMobileOtp`
 *           2. `POST /verifyMobileOtp`
 *
 *       After successful mobile verification, proceed with `POST /getAbhaAddressSuggestion`.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - otp
 *               - mobileNumber
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: "Customer ID used to fetch ABHA credentials."
 *                 example: "2"
 *               otp:
 *                 type: string
 *                 description: "OTP received on Aadhaar registered mobile number."
 *                 example: "378167"
 *               mobileNumber:
 *                 type: string
 *                 description: >
 *                   Mobile number for ABHA registration. Aadhaar linked mobile number is recommended.
 *                   If a different mobile number is provided, it must be verified using
 *                   `POST /generateMobileOtp` and `POST /verifyMobileOtp` APIs before proceeding.
 *                 example: "9556745708"
 *     responses:
 *       200:
 *         description: "OTP verified successfully and ABHA profile fetched"
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: "Response received successfully"
 *               data:
 *                 message: "This account already exist"
 *                 txnId: "2d32709e-131d-4108-8dd9-3085b21da701"
 *                 tokens:
 *                   token: "JWT_ACCESS_TOKEN"
 *                   expiresIn: 1800
 *                   refreshToken: "JWT_REFRESH_TOKEN"
 *                   refreshExpiresIn: 1296000
 *                 ABHAProfile:
 *                   preferredAddress: "sahoo424_249@sbx"
 *                   firstName: "Deepak"
 *                   middleName: "Kumar"
 *                   lastName: "Sahoo"
 *                   dob: "24-04-2002"
 *                   gender: "M"
 *                   photo: "BASE64_ENCODED_IMAGE"
 *                   mobile: "9556745708"
 *                   mobileVerified: true
 *                   email: null
 *                   phrAddress:
 *                     - "sahoo424_249@sbx"
 *                     - "sahoo424_24@sbx"
 *                     - "sahoo_04244@sbx"
 *                   address: "Kissan Nagar, Satya Vihar, Rasulgarh, Bhubaneswar, Khorda, Odisha"
 *                   districtCode: "362"
 *                   stateCode: "21"
 *                   pinCode: "751010"
 *                   abhaType: "STANDARD"
 *                   stateName: "ODISHA"
 *                   districtName: "KHORDHA"
 *                   communicationMobile: null
 *                   ABHANumber: "91-3616-8374-7832"
 *                   abhaStatus: "ACTIVE"
 *                 isNew: false
 *               timestamp: "2026-03-07T07:14:11.608Z"
 *       422:
 *         description: "OTP validation failed"
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 422
 *               success: false
 *               message: "UIDAI Error code : 400 : OTP validation failed"
 *               data: null
 *               timestamp: "2026-03-07T07:13:17.650Z"
 *       400:
 *         description: "Bad request or invalid input"
 *       500:
 *         description: "Internal server error"
 */
router.post('/verifyAadharOtp', AbhaController.verifyAadharOtp);

/**
 * @swagger
 * /abha/generateMobileOtp:
 *   post:
 *     summary: Generate Mobile OTP
 *     description: >
 *       Generates an OTP on the provided mobile number for mobile verification
 *       during the ABHA ID enrollment process.
 *
 *       This API is used when the mobile number provided during Aadhaar OTP
 *       verification is not linked with Aadhaar and needs to be verified separately.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - mobile
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *               mobile:
 *                 type: string
 *                 description: Mobile number on which OTP will be sent
 *                 example: "9556745708"
 *                 minLength: 10
 *                 maxLength: 10
 *                 pattern: "^[0-9]{10}$"
 *     responses:
 *       200:
 *         description: Mobile OTP sent successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: OTP sent successfully
 *               data:
 *                 txnId: "0e84b9c5-0b73-43ae-9c63-e9666acb1081"
 *                 message: "OTP sent to mobile number ending with ******5708"
 *               timestamp: "2026-03-09T06:07:08.368Z"
 *       400:
 *         description: Missing or invalid parameters
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: Mobile number is required
 *               data: null
 *               timestamp: "2026-03-09T06:07:08.368Z"
 *       500:
 *         description: Internal server error
 */
router.post('/generateMobileOtp', AbhaController.generateMobileOtp);

/**
 * @swagger
 * /abha/verifyMobileOtp:
 *   post:
 *     summary: Verify Mobile OTP
 *     description: >
 *       Verifies the OTP sent to the provided mobile number during the mobile verification step
 *       of ABHA ID enrollment.
 *
 *       After successful verification, the mobile number gets linked with the ABHA account
 *       and the transaction proceeds to the next step of ABHA address creation.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - otp
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *               otp:
 *                 type: string
 *                 description: OTP received on the mobile number
 *                 example: "483921"
 *                 minLength: 6
 *                 maxLength: 6
 *                 pattern: "^[0-9]{6}$"
 *     responses:
 *       200:
 *         description: Mobile OTP verified successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: OTP verified successfully
 *               data:
 *                 txnId: "68aec623-ad6b-410b-9840-314047a65157"
 *                 authResult: "success"
 *                 message: "Mobile number is now successfully linked to your Account"
 *                 accounts:
 *                   - ABHANumber: "91-3616-8374-7832"
 *               timestamp: "2026-03-09T06:16:34.180Z"
 *       400:
 *         description: OTP verification failed or invalid OTP
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: "Please enter a valid OTP. Entered OTP is either expired or incorrect."
 *               data: null
 *               timestamp: "2026-03-09T06:17:28.207Z"
 *       500:
 *         description: Internal server error
 */
router.post('/verifyMobileOtp', AbhaController.verifyMobileOtp);

/**
 * @swagger
 * /abha/getAbhaAddressSuggestion:
 *   post:
 *     summary: Get ABHA Address Suggestions
 *     description: >
 *       Retrieves suggested ABHA addresses for the user during the ABHA ID
 *       enrollment process. These suggestions are generated based on the
 *       user's profile details and can be used to create the final ABHA address.
 *
 *       After selecting a preferred address from the suggestion list,
 *       proceed with the ABHA address creation API.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *     responses:
 *       200:
 *         description: Address suggestions retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: Address suggestions retrieved successfully
 *               data:
 *                 txnId: "35ce141a-7a03-4495-92bc-17e767c1b187"
 *                 abhaAddressList:
 *                   - "sahoo_24242002"
 *                   - "sahoo_24200204"
 *                   - "sahoo_2002044"
 *                   - "sahoo_20020424"
 *                   - "sahoo_040424"
 *                   - "sahoo4_242002"
 *                   - "sahoo4_200224"
 *                   - "sahoo4_200204"
 *                   - "sahoo4_042002"
 *                   - "sahoo424_2002"
 *               timestamp: "2026-03-09T06:30:24.925Z"
 *       400:
 *         description: Missing or invalid parameters
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: customerId are required
 *               data: null
 *               timestamp: "2026-03-09T06:30:24.925Z"
 *       500:
 *         description: Internal server error
 */
router.post(
  '/getAbhaAddressSuggestion',
  AbhaController.getAbhaAddressSuggestion
);

/**
 * @swagger
 * /abha/setAbhaAddress:
 *   post:
 *     summary: Set ABHA Address
 *     description: >
 *       Sets the ABHA address for the user during the ABHA ID enrollment process.
 *
 *       The ABHA address can be selected from the suggestions received from
 *       `POST /getAbhaAddressSuggestion` API or a custom address can be provided
 *       by the user in the same format.
 *
 *       If the provided address is already taken or not allowed, the API will
 *       return an error indicating that the ABHA username is unavailable.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - abhaAddress
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *               abhaAddress:
 *                 type: string
 *                 description: >
 *                   Desired ABHA address username. It can be selected from the
 *                   suggestion list or provided as a custom username (without domain).
 *                 example: "sahoo424_2002"
 *     responses:
 *       200:
 *         description: ABHA Address set successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: ABHA Address set successfully
 *               data:
 *                 txnId: "79ec5523-2265-4de5-a258-eb705c7ccbf8"
 *                 healthIdNumber: "91-3616-8374-7832"
 *                 preferredAbhaAddress: "sahoo424_2002@sbx"
 *               timestamp: "2026-03-09T06:58:14.547Z"
 *       400:
 *         description: ABHA address already taken or not allowed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Provided ABHA address is already taken or not allowed
 *       500:
 *         description: Internal server error
 */
router.post('/setAbhaAddress', AbhaController.setAbhaAddress);

/**
 * @swagger
 * /abha/getUserDetails:
 *   post:
 *     summary: Get ABHA User Details
 *     description: >
 *       Fetches ABHA user profile details from ABDM and synchronizes them
 *       into the local database.
 *
 *       This API uses the stored access token and user data token to retrieve
 *       the ABHA account profile including demographic details, address,
 *       verification status, and profile photo.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *     responses:
 *       200:
 *         description: User details retrieved and synced successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: User details synced successfully
 *               data:
 *                 ABHANumber: "91-3616-8374-7832"
 *                 preferredAbhaAddress: "sahoo424_04@sbx"
 *                 mobile: "9556745708"
 *                 mobileVerified: true
 *                 name: "Deepak Kumar Sahoo"
 *                 firstName: "Deepak"
 *                 middleName: "Kumar"
 *                 lastName: "Sahoo"
 *                 gender: "M"
 *                 yearOfBirth: "2002"
 *                 monthOfBirth: "04"
 *                 dayOfBirth: "24"
 *                 pincode: "751010"
 *                 stateName: "ODISHA"
 *                 districtName: "KHORDHA"
 *                 townName: "Rasulgarh"
 *                 kycVerified: true
 *                 verificationStatus: "VERIFIED"
 *                 source: "OTP"
 *                 status: "ACTIVE"
 *                 createdDate: "11-08-2025"
 *               timestamp: "2026-03-09T09:09:57.340Z"
 *       400:
 *         description: Required Data token missing in DB for the user or expired token
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User data token not found
 *       500:
 *         description: Internal server error
 */
router.post('/getUserDetails', AbhaController.getUserDetails);

/**
 * @swagger
 * /abha/downloadAbhaCard:
 *   post:
 *     summary: Download ABHA Card
 *     description: >
 *       Downloads the ABHA card from ABDM and stores the card image
 *       in the local database as a Base64 encoded string.
 *
 *       The API requires a valid access token and user data token
 *       generated during the ABHA enrollment process.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *     responses:
 *       200:
 *         description: ABHA card downloaded successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: ABHA card downloaded and saved successfully
 *               data:
 *                 base64Card: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *               timestamp: "2026-03-09T09:17:22.723Z"
 *       400:
 *         description: Required Data token missing in DB for the user or expired token
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User data token not found
 *       500:
 *         description: Internal server error
 */
router.post('/downloadAbhaCard', AbhaController.downloadAbhaCard);

/**
 * @swagger
 * /abha/getUserByAadhar:
 *   post:
 *     summary: Login ABHA User Using Aadhaar
 *     description: >
 *       Initiates ABHA login using Aadhaar number. The Aadhaar number is
 *       encrypted using the ABDM public key and sent to the ABDM gateway.
 *
 *       If the Aadhaar is valid and linked with an ABHA account, an OTP
 *       will be sent to the Aadhaar registered mobile number.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - aadharNumber
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *               aadharNumber:
 *                 type: string
 *                 description: Aadhaar number of the user
 *                 example: "123412341234"
 *     responses:
 *       200:
 *         description: OTP sent to Aadhaar registered mobile number
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: ABHA login OTP sent successfully
 *               data:
 *                 txnId: "4667ea9f-dd2d-4eb8-adfc-7c00f77426fa"
 *                 message: "OTP sent to Aadhaar registered mobile number ending with ******5708"
 *               timestamp: "2026-03-09T09:42:18.156Z"
 *       400:
 *         description: Invalid Aadhaar or loginId
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: ABHA API Error
 *               data:
 *                 loginId: "Invalid LoginId"
 *                 timestamp: "2026-03-09 15:12:34"
 *               timestamp: "2026-03-09T09:42:34.698Z"
 *       500:
 *         description: Internal server error
 */
router.post('/getUserByAadhar', AbhaController.getUserByAadhar);

/**
 * @swagger
 * /abha/verifyGetByAadhar:
 *   post:
 *     summary: Verify Aadhaar Login OTP
 *     description: >
 *       Verifies the OTP sent to the Aadhaar registered mobile number during
 *       ABHA login. If the OTP is valid, the API returns user authentication
 *       tokens and ABHA account details.
 *
 *       If the OTP is invalid or expired, the response will contain
 *       `authResult: failed` with an appropriate message.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - otpValue
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *               otpValue:
 *                 type: string
 *                 description: OTP received on Aadhaar registered mobile number
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verification response received
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: API response received successfully
 *               data:
 *                 txnId: "4db25396-93fa-4ffc-9585-88cbab533abd"
 *                 authResult: "success"
 *                 message: "OTP verified successfully"
 *                 token: "eyJhbGciOiJSUzUxMiJ9..."
 *                 expiresIn: 1800
 *                 refreshToken: "eyJhbGciOiJSUzUxMiJ9..."
 *                 refreshExpiresIn: 1296000
 *                 accounts:
 *                   - ABHANumber: "91-3616-8374-7832"
 *                     preferredAbhaAddress: "sahoo424_04@sbx"
 *                     name: "Deepak Kumar Sahoo"
 *                     status: "ACTIVE"
 *                     mobileVerified: false
 *               timestamp: "2026-03-09T09:49:13.035Z"
 *
 *       200 (OTP Failed):
 *         description: OTP is invalid or expired
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: API response received successfully
 *               data:
 *                 txnId: "4db25396-93fa-4ffc-9585-88cbab533abd"
 *                 authResult: "failed"
 *                 message: "Please enter a valid OTP. Entered OTP is either expired or incorrect."
 *                 accounts: []
 *               timestamp: "2026-03-09T09:48:48.450Z"
 *
 *       400:
 *         description: Missing parameters
 *       500:
 *         description: Internal server error
 */
router.post('/verifyGetByAadhar', AbhaController.verifyGetByAadhar);

/**
 * @swagger
 * /abha/getUserByNumber:
 *   post:
 *     summary: Request ABHA Login OTP using Mobile Number
 *     description: >
 *       Sends an OTP to the mobile number registered with ABHA for login.
 *       The mobile number is encrypted using ABDM public key before sending
 *       it to the ABHA login API.
 *
 *       If the mobile number is not registered with ABHA, the API returns
 *       a `404` response indicating that the number does not exist.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - phone
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *               phone:
 *                 type: string
 *                 description: Mobile number registered with ABHA
 *                 example: "9876545708"
 *     responses:
 *       200:
 *         description: OTP sent successfully to registered mobile number
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: ABHA login OTP sent successfully
 *               data:
 *                 txnId: "31baf5c1-853e-47f1-bc40-bb049d0ff37c"
 *                 message: "OTP sent to mobile number ending with ******5708"
 *               timestamp: "2026-03-09T10:08:06.699Z"
 *
 *       404:
 *         description: Mobile number not registered with ABHA
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 404
 *               success: false
 *               message: This mobile number is not registered with ABHA.
 *               data: null
 *               timestamp: "2026-03-09T10:08:25.250Z"
 *
 *       400:
 *         description: Missing required parameters (customerId or phone)
 *
 *       500:
 *         description: Internal server error
 */
router.post('/getUserByNumber', AbhaController.getUserByNumber);

/**
 * @swagger
 * /abha/verifyGetByNumber:
 *   post:
 *     summary: Verify ABHA Login OTP using Mobile Number
 *     description: >
 *       Verifies the OTP sent to the mobile number registered with ABHA.
 *       The OTP is encrypted using the ABDM public key before sending it to the ABHA API.
 *       On successful verification, the API returns ABHA account details along with a reference token.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - otp
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *               otp:
 *                 type: string
 *                 description: OTP received on the registered mobile number
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully and ABHA accounts fetched
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: API response received successfully
 *               data:
 *                 txnId: "451b5778-7257-49c1-a49c-223ae4cff605"
 *                 authResult: "success"
 *                 message: "OTP verified successfully"
 *                 token: "eyJhbGciOiJSUzUxMiJ9..."
 *                 expiresIn: 300
 *                 accounts:
 *                   - ABHANumber: "91-3616-8374-7832"
 *                     preferredAbhaAddress: "sahoo424_04@sbx"
 *                     name: "Deepak Kumar Sahoo"
 *                     gender: "M"
 *                     dob: "24-04-2002"
 *                     verifiedStatus: "VERIFIED"
 *                     verificationType: "AADHAAR"
 *                     status: "ACTIVE"
 *                     kycVerified: true
 *                     mobileVerified: true
 *               timestamp: "2026-03-09T10:13:01.452Z"
 *
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: Please enter a valid OTP. Entered OTP is either expired or incorrect.
 *               data:
 *                 txnId: "451b5778-7257-49c1-a49c-223ae4cff605"
 *                 authResult: "failed"
 *                 message: Please enter a valid OTP. Entered OTP is either expired or incorrect.
 *                 accounts: []
 *               timestamp: "2026-03-09T10:13:01.452Z"
 *
 *       500:
 *         description: Internal server error
 */
router.post('/verifyGetByNumber', AbhaController.verifyGetByNumber);

/**
 * @swagger
 * /abha/verifyGetByNumberUser:
 *   post:
 *     summary: Verify ABHA User using ABHA Number
 *     description: >
 *       This API verifies the user account using the selected ABHA Number after OTP verification.
 *       It returns a user data token and refresh token which are required for fetching ABHA profile details.
 *
 *       Note:
 *       This API can be called only once per login transaction. After a successful or failed attempt,
 *       the same transaction cannot be used again.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - abhaNumber
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *               abhaNumber:
 *                 type: string
 *                 description: ABHA Number selected from the verified accounts list
 *                 example: "91-3455-0140-3728"
 *     responses:
 *       200:
 *         description: ABHA user verified successfully and user token generated
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: API response received successfully
 *               data:
 *                 token: "eyJhbGciOiJSUzUxMiJ9..."
 *                 expiresIn: 1800
 *                 refreshToken: "eyJhbGciOiJSUzUxMiJ9..."
 *                 refreshExpiresIn: 1296000
 *               timestamp: "2026-03-09T10:37:57.258Z"
 *
 *       401:
 *         description: Invalid ABHA number or session expired
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 401
 *               success: false
 *               message: Invalid ABHA number for this account or Session Expired.
 *               data: null
 *               timestamp: "2026-03-09T10:37:03.268Z"
 *
 *       400:
 *         description: Missing required parameters
 *
 *       500:
 *         description: Internal server error
 */
router.post('/verifyGetByNumberUser', AbhaController.verifyGetByNumberUser);

/**
 * @swagger
 * /abha/getAbhaUserByAbhaNumber:
 *   post:
 *     summary: Request OTP using ABHA Number
 *     description: >
 *       This API sends an OTP to the mobile number linked with the given ABHA Number.
 *       The ABHA Number is encrypted using the ABDM public key before sending it to the ABHA API.
 *
 *       The OTP can be generated either through the ABDM system (mobile OTP)
 *       or Aadhaar OTP depending on the selected scopeType and otpSystem.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - loginId
 *               - scopeType
 *               - otpSystem
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *               loginId:
 *                 type: string
 *                 description: ABHA Number of the user
 *                 example: "91-3455-0140-3728"
 *               scopeType:
 *                 type: string
 *                 description: Verification scope type
 *                 enum: [mobile-verify, aadhaar-verify]
 *                 example: "mobile-verify"
 *               otpSystem:
 *                 type: string
 *                 description: OTP system used for verification
 *                 enum: [abdm, aadhaar]
 *                 example: "abdm"
 *
 *     responses:
 *       200:
 *         description: OTP successfully sent to the mobile number linked with ABHA
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: API response received successfully
 *               data:
 *                 txnId: "7ab2b389-f226-457a-ba8b-b7cdf4450644"
 *                 message: "OTP sent to mobile number ending with ******5708"
 *               timestamp: "2026-03-09T11:32:47.497Z"
 *
 *       404:
 *         description: Invalid ABHA Number
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 404
 *               success: false
 *               message: Invalid ABHA number. Please verify and try again.
 *               data: null
 *               timestamp: "2026-03-09T11:33:05.425Z"
 *
 *       400:
 *         description: Invalid request parameters (scopeType or otpSystem)
 *
 *       500:
 *         description: Internal server error
 */
router.post('/getAbhaUserByAbhaNumber', AbhaController.getAbhaUserByAbhaNumber);

/**
 * @swagger
 * /abha/verifyGetByAbhaNumber:
 *   post:
 *     summary: Verify OTP for ABHA Number Login
 *     description: >
 *       This API verifies the OTP sent during ABHA Number login.
 *       The OTP is encrypted using the ABDM public key before being sent to the ABHA server.
 *       If verification is successful, it returns user tokens and account details.
 *     tags: [ABHA Milestone 1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - otp
 *               - scopeType
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *               otp:
 *                 type: string
 *                 description: OTP received on the registered mobile number
 *                 example: "866076"
 *               scopeType:
 *                 type: string
 *                 description: Verification scope type
 *                 enum: [mobile-verify, aadhaar-verify]
 *                 example: "mobile-verify"
 *
 *     responses:
 *       200:
 *         description: OTP verification response received
 *         content:
 *           application/json:
 *             examples:
 *               successResponse:
 *                 summary: OTP Verified Successfully
 *                 value:
 *                   statusCode: 200
 *                   success: true
 *                   message: API response received successfully
 *                   data:
 *                     txnId: "85bb2299-2697-46ac-aa26-f85a4c553cf9"
 *                     authResult: "success"
 *                     message: "OTP verified successfully"
 *                     token: "eyJhbGciOiJSUzUxMiJ9..."
 *                     expiresIn: 1800
 *                     refreshToken: "eyJhbGciOiJSUzUxMiJ9..."
 *                     refreshExpiresIn: 1296000
 *                     accounts:
 *                       - ABHANumber: "91-3455-0140-3728"
 *                         preferredAbhaAddress: "happy.happy01@sbx"
 *                         name: "Happy Swain"
 *                         status: "ACTIVE"
 *                         mobileVerified: false
 *                   timestamp: "2026-03-09T11:42:09.684Z"
 *
 *               failedOtp:
 *                 summary: OTP Expired or Invalid
 *                 value:
 *                   statusCode: 200
 *                   success: true
 *                   message: API response received successfully
 *                   data:
 *                     txnId: "85bb2299-2697-46ac-aa26-f85a4c553cf9"
 *                     authResult: "failed"
 *                     message: "OTP expired, please try again"
 *                     accounts: []
 *                   timestamp: "2026-03-09T11:42:25.284Z"
 *
 *       400:
 *         description: Invalid request parameters
 *
 *       500:
 *         description: Internal server error
 */
router.post('/verifyGetByAbhaNumber', AbhaController.verifyGetByAbhaNumber);

/**
 * @swagger
 * /abha/getAbhaUserByAbhaAddress:
 *   post:
 *     summary: Request OTP using ABHA Address
 *     description: >
 *       This API sends OTP to the mobile number linked with the given ABHA Address.
 *       The ABHA Address is encrypted using the ABDM public key before sending to ABDM server.
 *       OTP can be generated through ABDM mobile OTP system or Aadhaar OTP system.
 *     tags: [ABHA Milestone 1]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - abhaAddress
 *               - scopeType
 *               - otpSystem
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: "2"
 *               abhaAddress:
 *                 type: string
 *                 example: "sahoo424_249@sbx"
 *               scopeType:
 *                 type: string
 *                 enum: [mobile-verify, aadhaar-verify]
 *                 example: "mobile-verify"
 *               otpSystem:
 *                 type: string
 *                 enum: [abdm, aadhaar]
 *                 example: "abdm"
 *
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: API response received successfully
 *               data: "OTP is sent to Mobile number ending with ******5708"
 *               timestamp: "2026-03-10T05:06:00.453Z"
 *
 *       400:
 *         description: Invalid ABHA Address
 *         content:
 *           application/json:
 *             examples:
 *               invalidAddress:
 *                 summary: Invalid ABHA Address
 *                 value:
 *                   statusCode: 400
 *                   success: false
 *                   message: Invalid ABHA address. Please check and try again.
 *                   data:
 *                     code: "ABDM-9999"
 *                     message: "User not found"
 *                   timestamp: "2026-03-10T05:06:33.343Z"
 *
 *               multipleOtpAttempts:
 *                 summary: Multiple OTP attempts exceeded
 *                 value:
 *                   statusCode: 400
 *                   success: false
 *                   message: You have requested multiple OTPs Or Exceeded maximum number of attempts for OTP match in this transaction. Please try again in 30 minutes.
 *                   data:
 *                     code: "ABDM-1100"
 *                     message: You have requested multiple OTPs Or Exceeded maximum number of attempts for OTP match in this transaction. Please try again in 30 minutes.
 *                   timestamp: "2026-03-10T05:20:37.531Z"
 *
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/getAbhaUserByAbhaAddress',
  AbhaController.getAbhaUserByAbhaAddress
);

/**
 * @swagger
 * /abha/verifyGetByAbhaAddress:
 *   post:
 *     summary: Verify OTP for ABHA Address Login
 *     description: >
 *       This API verifies the OTP sent to the mobile number linked with the ABHA Address.
 *       The OTP is encrypted using the ABDM public key before sending it to the ABDM server.
 *       If verification is successful, user tokens are returned and stored for future API access.
 *     tags: [ABHA Milestone 1]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - otp
 *               - scopeType
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials
 *                 example: "2"
 *               otp:
 *                 type: string
 *                 description: OTP received on the registered mobile number
 *                 example: "417606"
 *               scopeType:
 *                 type: string
 *                 description: Verification scope
 *                 enum: [mobile-verify, aadhaar-verify]
 *                 example: "aadhaar-verify"
 *
 *           examples:
 *             mobileVerify:
 *               summary: Mobile OTP Verification
 *               value:
 *                 customerId: "2"
 *                 otp: "417606"
 *                 scopeType: "mobile-verify"
 *
 *             aadhaarVerify:
 *               summary: Aadhaar OTP Verification
 *               value:
 *                 customerId: "2"
 *                 otp: "417606"
 *                 scopeType: "aadhaar-verify"
 *
 *     responses:
 *       200:
 *         description: OTP verification response received
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: API response received successfully
 *               data:
 *                 txnId: "fbbf3f1b-12c4-4e6e-bc41-xxxxx"
 *                 authResult: "success"
 *                 message: "OTP verified successfully"
 *                 tokens:
 *                   token: "eyJhbGciOiJSUzUxMiJ9..."
 *                   expiresIn: 1800
 *               timestamp: "2026-03-10T05:17:10.601Z"
 *
 *       400:
 *         description: Invalid or Expired OTP
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: Invalid or Expired OTP. Please try again.
 *               data:
 *                 code: "ABDM-9999"
 *                 message: "Transaction is not found for UUID."
 *               timestamp: "2026-03-10T05:17:17.601Z"
 *
 *       500:
 *         description: Internal Server Error
 */
router.post('/verifyGetByAbhaAddress', AbhaController.verifyGetByAbhaAddress);

/**
 * @swagger
 * /abha/abhaAddressUserDetails:
 *   post:
 *     summary: Fetch and Sync ABHA Address User Profile
 *     description: >
 *       This API fetches the ABHA user profile using the ABHA Address login session.
 *       It retrieves the profile from ABDM PHR service and stores or updates the
 *       user profile in the local database.
 *     tags: [ABHA Milestone 1]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA credentials and session tokens
 *                 example: "2"
 *
 *     responses:
 *       200:
 *         description: ABHA Address profile fetched and synced successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: ABHA Address Profile synced successfully
 *               data:
 *                 customer_id: "2"
 *                 abha_number: "91-3455-0140-3728"
 *                 abha_address: "happy.happy01@sbx"
 *                 mobile: "9556745708"
 *                 first_name: "Happy"
 *                 middle_name: null
 *                 last_name: "Swain"
 *                 full_name: "Happy Swain"
 *                 gender: "M"
 *                 year_of_birth: "1996"
 *                 month_of_birth: "04"
 *                 day_of_birth: "12"
 *                 pincode: "751001"
 *                 address: "Bhubaneswar"
 *                 state_name: "Odisha"
 *                 district_name: "Khordha"
 *                 profile_photo: null
 *                 kyc_verified: true
 *                 verification_status: "VERIFIED"
 *                 abha_status: "ACTIVE"
 *                 abha_created_at: "1996-04-12"
 *               timestamp: "2026-03-10T06:10:10.453Z"
 *
 *       400:
 *         description: Missing or invalid required parameters
 *
 *       401:
 *         description: Invalid or expired session tokens
 *
 *       500:
 *         description: Internal Server Error
 */
router.post('/abhaAddressUserDetails', AbhaController.abhaAddressUserDetails);

/**
 * @swagger
 * /abha/getPhrAbhaCard:
 *   post:
 *     summary: Download ABHA PHR Card
 *     description: >
 *       This API fetches the ABHA PHR card from ABDM servers using the authenticated
 *       user session. The card is returned as a Base64 encoded image and also stored
 *       in the local database for the corresponding customer.
 *     tags: [ABHA Milestone 1]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID used to fetch ABHA session tokens
 *                 example: "2"
 *
 *     responses:
 *       200:
 *         description: ABHA Card downloaded successfully
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: ABHA card downloaded and saved successfully
 *               data:
 *                 base64Card: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *               timestamp: "2026-03-10T07:10:22.453Z"
 *
 *       400:
 *         description: Missing customerId or session tokens
 *         content:
 *           application/json:
 *             example:
 *               statusCode: 400
 *               success: false
 *               message: User data token not found
 *               data: null
 *
 *       401:
 *         description: Unauthorized or expired ABHA session
 *
 *       500:
 *         description: Internal Server Error
 */
router.post('/getPhrAbhaCard', AbhaController.getPhrAbhaCard);

module.exports = router;
