// Import necessary modules
import Auth from "../common/auth.js";
import crypto from 'crypto';
import emailService from "../common/emailService.js";
import adminModel from "../models/admin.js";
import userModel from "../models/user.js";
import engineerModel from "../models/engineer.js" 
import serviceModel from "../models/service.js";
import CompletedService from "../common/CompletedService.js";


// Function to get user data by ID
const getuser = async (req, res) => {
  try {
   
    let id = await req.params.id;

    // Find the user based on the id
    let user = await userModel.findOne({ _id: id });
    

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

//Function to get the active engineerId
const ActiveEngineers = async (req, res) => {
  try {
    
    let engineers = await engineerModel.find({
      assignedusers: []
    });
    
    // Retrieve engineers with assigned users array empty or count less than 2
    let assignedengineers = await engineerModel.countDocuments({assignedusers:{ $size: 2 }})
    return res.status(200).send({
      message: "Data Fetched Successfully",
      engineers,
      assignedengineers
    });
  } catch (error) {
    
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function to get service details for a user
const service = async (req, res) => {
  try {
   
    let id = req.params.id
    
    // Find the user based on the id
    let user = await userModel.find({ _id: id});
    
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

// Function to assign an engineer to a user
const assignEngineer = async (req, res) => {
  try {
    // Extract userId from request parameters and engineer from the request body
    const userId = req.params.id;
    const name = req.body.name

    // Find the user by their ID
    const user = await userModel.findById(userId);

    // Check if the user is already assigned to an engineer
    if (user.serviceEngineer) {
      return res.status(400).send({
        message: "User is already assigned to an engineer",
      });
    }

    // Find the engineer by their ID
    const engineer = await engineerModel.findOne(name);

    if (user && engineer) {
      // Update user's service engineer
      user.serviceEngineer = engineer._id;
      engineer.assignedusers = userId
      // Save changes to the database
      await user.save();
      await engineer.save()

      // Send a success response with details
      return res.status(201).send({
        message: `User ${user.name} assigned to Engineer ${engineer.name} successfully`,
        user: user,
      });
    } else {
      // Send an error response if the assignment fails
      return res.status(400).send({
        message: "Invalid User or Engineer information",
      });
    }
  } catch (error) {
    // Handle server error
    console.error("Error assigning engineer:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



// Function to get the count of documents (engineer, user, service)
const getReports = async (req, res) => {
  try {
    // Count documents in different models
    const userCount = await userModel.countDocuments({ createdAt: { $exists: true } });
    const engineerCount = await engineerModel.countDocuments({ createdAt: { $exists: true } });
    const service = await serviceModel.countDocuments({ Date: { $exists: true } })

    // Count pending and completed users
    const pendingusers = await userModel.countDocuments({status:true})
    const completedusers = await userModel.countDocuments({action:false})

    // Send the counts in the response
    res.status(200).json({ userCount, engineerCount, service, pendingusers, completedusers });
  } catch (error) {
    // Handle server error
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const serviceReports = async (req, res) => {
  try {
    const currentDate = new Date();
   
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const userCountsByDate = await userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert the result to a more readable format if needed
    const userCountsByDateFormatted = {};
    userCountsByDate.forEach((result) => {
      const {  day } = result._id;
      const formattedDate = `${day < 10 ? '0' + day : day}`;
      userCountsByDateFormatted[formattedDate] = result.count;
    });

    res.status(200).json(userCountsByDateFormatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Function to update user action
const updateAction = async (req, res) => {
  try {
    // Extract update from the request body
    const update = req.body;
    const id = req.params.id;
    let user = await userModel.findById(id);

    // Check if the user was found
    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }
    
    user.action = update === "Completed" ? false : true;

    console.log(user.action)
    // Save the updated user
    await user.save();
    
    await CompletedService.Service({name: user.name, email:user.email});

    // Send a success response with details
    res.status(200).send({
      message: "Action Updated",
      completedUsers: user,
    });
  } catch (error) {
    // Handle server error
    res.status(500).send({
      message: "Invalid data",
      error: error.message,
    });
  }
};

// Function to get completed users
const completedUsers = async (req, res) => {
  try {
    // Decode the token to get admin information
    let token = req.headers.authorization?.split(" ")[1]
    let data = await Auth.decodeToken(token)

    // Find users with action: false
    const users = await userModel.find({ action: false });
    let admin = await adminModel.findOne({email:data.email})

    // Check if any users were found
    if (!users || users.length === 0) {
      return res.status(404).send({
        message: "No users with pending action found",
      });
    }

    // Add found users to adminModel's completedReq array
    admin.completedReq.push(...users);

    // Save changes to the database
    await admin.save();

    // Send a success response with details
    res.status(200).send({
      message: "Completed Requests",
      completedUsers: users,
    });
  } catch (error) {
    // Handle server error
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function to verify admin account
const verifyAdmin = async(req,res)=>{
  try {
    // Decode the token to get admin information
    let token = req.headers.authorization?.split(" ")[1]
    let data = await Auth.decodeToken(token)
    let admin = await adminModel.findOne({ email: data.email });
    
    if (admin) {
      // Generate a unique token to verify email address
      let code;
      let isCodeUnique = false;

      // Keep generating a new code until it is unique
      do {
          code = crypto.randomBytes(20).toString('hex');
          // Check if the code is unique
          isCodeUnique = !(await adminModel.exists({ resetToken: code }));
      } while (!isCodeUnique);

      

      // Send the reset URL via email
      await emailService.VerifyService({name: admin.name, code, email:admin.email});

      res.status(200).send({
          message: `Email verification code sent to ${admin.email}. Please check your email and confirm.`,
          code, 
      });
    } else {
      res.status(400).send({
          message: `Account with ${admin.email} does not exist`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
}

// Function to create a new admin
const createAdmin = async (req, res) => {
  try {
    // Check if user with the given email already exists
    const existingUser = await adminModel.findOne({ email: req.body.email });

    if (!existingUser) {
      // Hash the password before storing it in the database
      req.body.password = await Auth.hashPassword(req.body.password);

      // Create a new user
      await adminModel.create(req.body);

      // Respond with a 201 status indicating successful creation
      res.status(201).send({
        message: "Admin created successfully",
      });
    } else {
      // User with the email already exists
      res.status(400).send({
        message: `Admin with ${req.body.email} already exists`,
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

// Function for admin login
const login = async(req,res)=>{
  try {
    let admin = await adminModel.findOne({ $or: [ { email: req.body.email },{ phonenumber: req.body.phonenumber } ] })
   
    if(admin){
      let hashCompare = await Auth.hashCompare(req.body.password,admin.password)
      if(hashCompare){
        let token = await Auth.createToken({
          name: admin.name,
          email: admin.email,
          phonenumber:admin.phonenumber,
          role:admin.role,
        })
       
        res.status(200).send({
          message: "Admin Logged in successfully",
          token
        });
      } else {
        res.status(400).send({
          message: "Invalid password"
        });
      }
    } else {
      res.status(400).send({
        message: "Email doesn't exist",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

// Function for admin password reset request
const forgotPassword = async (req, res) => {
  try {
    let admin = await adminModel.findOne({ email: req.body.email }, { password: 0 });

    if (admin) {
      // Generate a unique token for password reset
      let code;
      let isCodeUnique = false;

      // Keep generating a new code until it is unique
      do {
        code = crypto.randomBytes(20).toString('hex');
        // Check if the code is unique
        isCodeUnique = !(await adminModel.exists({ resetToken: code }));
      } while (!isCodeUnique);

      // Save the token in the user document
      admin.resetToken.push(code);
      await admin.save();

      // Send the reset URL via email
      await emailService.VerifyService({name: admin.name, code, email:req.body.email});

      res.status(200).send({
        message: 'Reset Password verification code sent. Please check your email and confirm.',
        code, 
      });
    } else {
      res.status(400).send({
        message: `Account with ${req.body.email} does not exist`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
}

// Function to reset admin password
const resetPassword = async(req,res)=>{
  try {
    let token = req.headers.authorization?.split(" ")[1]
    let data = await Auth.decodeToken(token)

    if(req.body.newpassword === req.body.confirmpassword) {
      let admin = await adminModel.findOne({email:data.email})
      admin.password = await Auth.hashPassword(req.body.newpassword)
      await admin.save()

      res.status(200).send({
        message:"Password Updated Successfully",
      });
    } else {
      res.status(400).send({
        message:"Passwords Do Not Match",
      });
    }
  } catch (error) {
    
    res.status(500).send({
      message:"Internal Server Error",
      error:error.message
    });
  }
}

// Function to get admin details
const getadmin = async (req, res) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];
    let data = await Auth.decodeToken(token);
   
    const admin = await adminModel.findOne({email:data.email});
    
    
    if (admin) {
      res.send({
        message: "Data is fetched successfully",
        admin: admin,
      });
    } else {
      res.status(404).send({
        message: "Admin not found. Invalid ID.",
      });
    }
  } catch (error) {
    console.error("Error:", error);

    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function to edit admin details
const EditAdmin = async (req, res) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];
    let data = await Auth.decodeToken(token);
    let id = await adminModel.findOne({ id: data._id });

    const admin = await adminModel.findById(id);

    if (admin) {
      const {
        name,
        email,
        phonenumber,
      } = req.body;

      if (name) admin.name = name;
      if (email) admin.email = email;
      if (phonenumber) admin.phonenumber = phonenumber;

      // Save the updated admin
      await admin.save();

      res.status(200).send({
        message: "Admin Data Saved",
        Admin: admin,
      });
    } else {
      res.status(400).send({ message: "Invalid Admin data" });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



 export default {

  getuser,
  ActiveEngineers,
  service,
  assignEngineer,
  updateAction,
  completedUsers,
  getReports,
  serviceReports,
  
  verifyAdmin,
  createAdmin,
  getadmin,
  EditAdmin,
  login,
  forgotPassword,
  resetPassword,

 
};
