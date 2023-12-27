import userModel from "../models/user.js";
import serviceModel from "../models/service.js";
import emailService from "../common/emailService.js";
import Auth from "../common/auth.js";
import crypto from "crypto";



// Function to get all users
const AllUsers = async (req, res) => {
  try {
    // Retrieve all users from the database
    let user = await userModel.find({});

    if (user) {
      // Send a success response with user data
      res.status(200).send({
        message: "All user data fetched successfully",
        user: user,
      });
    } else {
      // Send a 404 response if no users are found
      res.status(404).send({
        message: "No user's found",
      });
    }
  } catch (error) {
    // Handle internal server error
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function to get active users
const getActiveUsers = async (req, res) => {
  try {
    // Retrieve users unassigned users
    let activeuser = await userModel.find({serviceEngineer:{$exists:false}});
    return res.status(200).send({
      message: "User Data Fetched Successfully",
      activeuser,
    });
  } catch (error) {
    // Handle internal server error
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function to verify user and send verification code
const verifyUser = async (req, res) => {
  try {
    // Decode the token from the request headers
    let token = req.headers.authorization?.split(" ")[1];
    let data = await Auth.decodeToken(token);
    
    // Find the user based on the decoded email
    let user = await userModel.findOne({ email: data.email });

    if (user) {
      // Generate a unique verification code
      let code;
      let isCodeUnique = false;

      // Keep generating a new code until it is unique
      do {
        code = crypto.randomBytes(20).toString('hex');
        // Check if the code is unique
        isCodeUnique = !(await userModel.exists({ resetToken: code }));
      } while (!isCodeUnique);

      console.log(code);

      // Send the verification code via email
      await emailService.VerifyService({ name: user.name, code, email: user.email });

      // Respond with a success message and the verification code
      res.status(200).send({
        message: `Email verification code sent to ${user.email}. Please check your email and confirm.`,
        code,
      });
    } else {
      // Send an error response if the user does not exist
      res.status(400).send({
        message: `Account with ${user.email} does not exist`,
      });
    }
  } catch (error) {
    // Handle internal server error
    console.error(error);
    res.status(500).send({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Function to book a service for a user
const BookService = async (req, res) => {
  try {
    // Ensure the token exists before attempting to decode
    const token = req.headers.authorization?.split(" ")[1];
    
    const existingservice = await serviceModel.findOne({ phonenumber: req.body.phonenumber });
    

    if (!token) {
      // Send an unauthorized response if the token is missing
      return res.status(401).send({
        message: "Unauthorized: Token is missing",
      });
    }

    // Decode the token to get user information
    const data = await Auth.decodeToken(token);

    // Find the user based on the decoded email
    const user = await userModel.findOne({ email: data.email });

    // Condition to check if the user exists
    if (user && !existingservice) {
      // Create a new service object from the request body
      const newService = await serviceModel.create(req.body);
      
      // Save the new service to the database
      await newService.save();

      // Push the new service into the user's service array
      user.service.push(newService);

      // Save the updated user to the database
      await user.save();

      // Respond with a success message and user data
      res.status(201).send({
        message: "Service created successfully",
        user,
      });
    } else {
      // Send an error response if the user does not exist
      res.status(404).send({
        message: `User with ${data.email} does not exist or Existing Service`,
      });
    }
  } catch (error) {
    // Handle internal server error
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function to edit service details
const EditService = async (req, res) => {
  try {
    // Decode the token from the request headers
    let token = req.headers.authorization?.split(" ")[1];
    let data = await Auth.decodeToken(token);

    // Find the user based on the decoded email
    let user = await userModel.find({ email: data.email });
    console.log(user);

    // Access the first service object
    const serviceDetails = user.service[0][0];

    // Update service details if the fields are provided
    if (brand) serviceDetails.brand = brand;
    if (model) serviceDetails.model = model;
    if (manufactureyear) serviceDetails.manufactureyear = manufactureyear;
    if (servicetype) serviceDetails.servicetype = servicetype;

    // Save the user
    await user.save();

    // Respond with a success message and user data
    res.status(200).send({
      message: "User Service Data Updated",
      user: user,
    });
  } catch (error) {
    // Handle internal server error
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function to get service details for a user
const servicedetails = async (req, res) => {
  try {
    // Decode the token from the request headers
    let token = req.headers.authorization?.split(" ")[1];
    let data = await Auth.decodeToken(token);
    
    // Find the user based on the decoded email
    let user = await userModel.find({ email: data.email });
    
    // Respond with service details if the user exists
    if (user) {
      res.status(200).send({
        message: "User's Service are fetched successfully",
        user,
      });
    }
  } catch (error) {
    // Handle internal server error
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function to get user data by ID
const getUserByid = async (req, res) => {
  try {
    // Decode the token from the request headers
    let token = req.headers.authorization?.split(" ")[1];
    let data = await Auth.decodeToken(token);

    // Find the user based on the decoded email
    let user = await userModel.findOne({ email: data.email });
    console.log(user);

    // Respond with user data if the user exists
    if (user) {
      res.send({
        message: "Data is fetched successfully",
        user: user,
      });
    } else {
      // Send a 404 response if the user is not found
      res.status(404).send({
        message: "User not found. Invalid ID.",
      });
    }
  } catch (error) {
    // Handle internal server error
    console.error("Error:", error);

    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function to edit user details
const EditUser = async (req, res) => {
  try {
    // Decode the token from the request headers
    let token = req.headers.authorization?.split(" ")[1];
    let data = await Auth.decodeToken(token);
   
    // Find the user based on the decoded email
    const user = await userModel.findOne({ email: data.email });
    console.log(user)

    // Send a 404 response if the user is not found
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Destructure properties from the request body
    const {
      name,
      email,
      phonenumber,
      brand,
      model,
      manufactureyear,
      servicetype,
    } = req.body;

    // Update user properties if provided in the request
    if (name) user.name = name;
    if (email) user.email = email;
    if (phonenumber) user.phonenumber = phonenumber;

    // Update service properties if provided in the request
    if (user.service) {
      const service = user.service[0][0]; 
      if (brand) service.brand = brand;
      if (model) service.model = model;
      if (manufactureyear) service.manufactureyear = manufactureyear;
      if (servicetype) service.servicetype = servicetype;

      // Update user's service reference
      user.service = [service];
    }

    // Save the updated user
    await user.save();

    // Respond with a success message and user data
    res.status(200).send({
      message: "User Data Saved",
      user: user,
    });
  } catch (error) {
    // Handle internal server error
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function to create new users
const createUsers = async (req, res) => {
  try {
    // Check if user with the given email already exists
    const existingUser = await userModel.findOne({ email: req.body.email });

    if (!existingUser) {
      // Hash the password before storing it in the database
      req.body.password = await Auth.hashPassword(req.body.password);

      // Create a new user
      await userModel.create(req.body);

      // Respond with a success message indicating successful creation
      res.status(201).send({
        message: "User created successfully",
      });
    } else {
      // Send a 400 response if the user already exists
      res.status(400).send({
        message: `User with ${req.body.email} already exists`,
      });
    }
  } catch (error) {
    // Handle internal server error
    console.error("Error creating user:", error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function for user login
const login = async (req, res) => {
  try {
    // Find user by email or phone number
    let user = await userModel.findOne({
      $or: [{ email: req.body.email }, { phonenumber: req.body.phonenumber }],
    });

    if (user) {
      // Compare hashed password with the provided password
      let hashCompare = await Auth.hashCompare(req.body.password, user.password);

      if (hashCompare) {
        // Create a token for the user and respond with success
        let token = await Auth.createToken({
          name: user.name,
          email: user.email,
          phonenumber: user.phonenumber,
          role: user.role,
        });
        res.status(200).send({
          message: "User Logged in successfully",
          token,
        });
      } else {
        // Send a 400 response for invalid password
        res.status(400).send({
          message: "Invalid password",
        });
      }
    } else {
      // Send a 400 response for invalid email
      res.status(400).send({
        message: "Invalid email",
      });
    }
  } catch (error) {
    // Handle internal server error
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function for initiating the password reset process
const forgotPassword = async (req, res) => {
  try {
    // Find user by email and exclude password field
    let user = await userModel.findOne(
      { email: req.body.email },
      { password: 0 }
    );

    if (user) {
      // Generate a unique token for password reset
      let code;
      let isCodeUnique = false;

      // Keep generating a new code until it is unique
      do {
        code = crypto.randomBytes(20).toString("hex");
        // Check if the code is unique
        isCodeUnique = !(await userModel.exists({ resetToken: code }));
      } while (!isCodeUnique);

      // Save the token in the user document
      user.resetToken.push(code);
      await user.save();

      // Send the reset URL via email
      await emailService.VerifyService({
        name: user.name,
        code,
        email: req.body.email,
      });

      // Respond with success and the verification code
      res.status(200).send({
        message:
          "Reset Password verification code sent. Please check your email and confirm.",
        code,
      });
    } else {
      // Send a 400 response for an account that does not exist
      res.status(400).send({
        message: `Account with ${req.body.email} does not exist`,
      });
    }
  } catch (error) {
    // Handle internal server error
    console.error(error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function to reset the user's password
const resetPassword = async (req, res) => {
  try {
    // Decode the token from the request headers
    let token = req.headers.authorization?.split(" ")[1];
    let data = await Auth.decodeToken(token);

    // Check if the new password and confirm password match
    if (req.body.newpassword === req.body.confirmpassword) {
      // Find user by email and update the password
      let user = await userModel.findOne({ email: data.email });
      user.password = await Auth.hashPassword(req.body.newpassword);
      await user.save();

      // Respond with success
      res.status(200).send({
        message: "Password Updated Successfully",
      });
    } else {
      // Send a 400 response for mismatched passwords
      res.status(400).send({
        message: "Password Does Not match",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default {
  AllUsers,
  verifyUser,
  BookService,
  servicedetails,
  EditService,

  getActiveUsers,
  getUserByid,
  EditUser,
  createUsers,
  login,
  forgotPassword,
  resetPassword,
};
