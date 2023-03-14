const Review = require("../models/review");
const User = require("../models/user");

module.exports.home = async (req, res) => {
  {
    let users = await User.find({}).populate("username");
    if (req.isAuthenticated() && req.user.role === "admin") {
      return res.redirect("/dashboard");
    } else if (req.isAuthenticated() && !(req.user.role === "admin")) {
      return res.redirect(`employee-dashboard/${req.user.id}`);
    }
    let data = res.render("signin", {
      title: "Employess",
      users: users,
    });
    return data;
  }
};
module.exports.signup = async (req, res) => {
  // If user is already authenticated as an admin, redirect to admin dashboard
  if (req.isAuthenticated() && req.user.role === "admin") {
    return res.redirect("/admin-dashboard");
  } 
  // If user is already authenticated as an employee, redirect to employee dashboard
  else if (req.isAuthenticated() && !(req.user.role === "admin")) {
    return res.redirect(`employee-dashboard/${req.user.id}`);
  } 
  // Otherwise, render signup page
  else {
    return res.render("signup", {
      title: "Review system | SignUp",
    });
  }
};

module.exports.dashboard = async (req, res) => {
  try {
    // Find all users and populate their username fields
    let users = await User.find({}).populate("username");
    // Render dashboard page with list of users
    return res.render("dashboard", {
      title: "Dashboard",
      users: users,
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/");
  }
};

// Controller function to render the signin page
module.exports.signin = async (req, res) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    // Redirect to dashboard if user is an admin
    return res.redirect("/dashboard");
  } else if (req.isAuthenticated() && !(req.user.role === "admin")) {
    // Redirect to employee dashboard if user is an employee
    return res.redirect(`employee-dashboard/${req.user.id}`);
  } else {
    // Render the signin page if user is not authenticated
    return res.render("signin", {
      title: "Review system | SignIn",
    });
  }
};

// Controller function to logout the user
module.exports.signout = async (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    // Flash success message and redirect to home page
    req.flash("success", "Successfully Logged out!");
    return res.redirect("/");
  });
};

// Render the admin dashboard
module.exports.adminpannel = async (req, res) => {
  try {
    // Check if user is authenticated and has admin role
    if (req.isAuthenticated() && req.user.role === "admin") {
      // Fetch all users from database and exclude current user
      let users = await User.find({}).populate("username");
      let filteredUsers = users.filter((user) => user.email !== req.user.email);

      // Render the "dashboard_admin" view with filtered users
      return res.render("dashboard_admin", {
        title: "Admin panel",
        users: filteredUsers,
      });
    } else if (req.isAuthenticated() && !(req.user.role === "admin")) {
      // Redirect to homepage if authenticated but not an admin
      return res.redirect("back");
    } else {
      // Redirect to homepage if not authenticated
      return res.redirect("/");
    }
  } catch (err) {
    // Log and redirect to homepage on error
    console.log(err);
    return res.redirect("/");
  }
};

// Render the employee dashboard
module.exports.employeepannel = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      // Fetch the employee by ID and populate reviews and assigned reviews
      const employee = await User.findById(req.params.id)
        .populate({
          path: "reviewsFromOthers",
          populate: {
            path: "reviewer",
            model: "User",
          },
        })
        .populate("assignedReviews");

      const reviewsFromOthers = employee.reviewsFromOthers;
      const assignedReviews = employee.assignedReviews;

      // Fetch all reviews and populate the reviewer field
      const populatedResult = await Review.find().populate({
        path: "reviewer",
        model: "User",
      });

      // Render the "employee_dashboard" view with employee and reviews data
      return res.render("employee_dashboard", {
        title: "Employee panel",
        employee,
        assignedReviews,
        reviewsFromOthers,
      });
    } else {
      // Redirect to homepage if not authenticated
      return res.redirect("/");
    }
  } catch (err) {
    // Log and redirect to previous page on error
    console.log(err);
    return res.redirect("back");
  }
};

// This function renders the add_employee page if the user is authenticated and has the role of "admin"
// Otherwise, it redirects to the homepage
module.exports.addemployee = async (req, res) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return res.render("add_employee", {
      title: "Add Employee ",
    });
  }
  if (req.isAuthenticated() && !(req.user.role === "admin")) {
    return res.redirect("/");
  } else {
    return res.redirect("/");
  }
};


// This function tries to find the employee by id and populates its reviewsFromOthers property with the corresponding reviewer data.
// If the user is authenticated and has the role of "admin", it renders the employee_edit page with the found employee and its reviewsFromOthers data.
// Otherwise, it redirects to the homepage.
module.exports.editemployee = async (req, res) => {
  try {
    if (req.isAuthenticated() && req.user.role === "admin") {
      const employee = await User.findById(req.params.id).populate({
        path: "reviewsFromOthers",
        populate: {
          path: "reviewer",
          model: "User",
        },
      });
      const reviewsFromOthers = employee.reviewsFromOthers;
      return res.render("employee_edit", {
        title: "Employee-Edit",
        employee,
        reviewsFromOthers,
      });
    } else return res.redirect("/");
  } catch (err) {
    console.log("error", err);
    return res.redirect("back");
  }
};

// ****************************************** Update an employee's details******************************
module.exports.updateemployee = async (req, res) => {
  try {
    // Find the employee to update by their ID
    const employee = await User.findById(req.params.id);

    // Get the updated employee details from the request body
    const { username, role } = req.body;

    if (employee) {
      // Update the employee's username and role
      employee.username = username;
      employee.role = role;
      // Save the updated employee to the database
      employee.save();

      // Display a success message and redirect the user back to the previous page
      req.flash("success", "Updated employee details!");
      return res.redirect("back");
    } else {
      // Display an error message and redirect the user back to the previous page
      req.flash("error", "This employee is not found!");
      return res.redirect("back");
    }
  } catch (err) {
    // Display an error message and redirect the user back to the previous page
    console.log("error", err);
    return res.redirect("back");
  }
};

// ********************************Create a new user account **********************************
module.exports.createuser = async (req, res) => {
  try {
    // Get the user details from the request body
    const { username, email, password, confirm_password, role } = req.body;

    if (password === confirm_password) {
      // Check if a user with the same email already exists
      User.findOne({ email }, async (err, user) => {
        if (err) {
          console.log("User not found in signing up");
          return;
        }

        if (!user) {
          // Create a new user with the given details
          await User.create(
            {
              email,
              password,
              username,
              role,
            },
            (err, user) => {
              if (err) {
                // Display an error message if user creation fails
                req.flash("error", "Sign Up failed");
              }
              // Display a success message and redirect the user to the homepage
              req.flash("success", "Successfully created an account!");
              return res.redirect("/");
            }
          );
        } else {
          // Display an error message and redirect the user back to the previous page
          req.flash("error", "User already registed!");
          return res.redirect("back");
        }
      });
    } else {
      // Display an error message and redirect the user back to the previous page
      req.flash("error", "Password and Confirm password did'nt matched");
      return res.redirect("back");
    }
  } catch (err) {
    // Display an error message and redirect the user back to the previous page
    console.log("error", err);
    return res.redirect("back");
  }
};

// *******************************************create new employee ***************************************
module.exports.createemployee = async (req, res) => {
  try {
    const { username, email, password, confirm_password } = req.body;

    // Check if password and confirm password match
    if (password === confirm_password) {
      // Find user by email
      User.findOne({ email }, async (err, user) => {
        if (err) {
          console.log("User not found in signing up");
          return;
        }

        // If user doesn't exist, create new user
        if (!user) {
          await User.create(
            {
              email,
              password,
              username,
            },
            (err, user) => {
              if (err) {
                req.flash("error", "Error in adding employee");
              }
              req.flash("success", "Employee added!");
              return res.redirect("/admin-dashboard");
            }
          );
        } else {
          // If user already exists, return error message
          req.flash("error", "Employee exist!");
          return res.redirect("back");
        }
      });
    } else {
      // If password and confirm password don't match, return error message
      req.flash("error", "Password and Confirm password did'nt matched");
      return res.redirect("back");
    }
  } catch (err) {
    console.log("error", err);
    return res.redirect("back");
  }
};

// ****************************Delete user and associated reviews******************************

module.exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    // Delete reviews where user is the recipient
    await Review.deleteMany({ recipient: id });

    // Delete reviews where user is the reviewer
    await Review.deleteMany({ reviewer: id });

    // Delete user
    await User.findByIdAndDelete(id);

    req.flash("success", `User and associated reviews deleted successfully!`);
    return res.redirect("back");
  } catch (err) {
    console.log("error", err);
    return res.redirect("back");
  }
};

//  *******************************UPDATING THE REVIEW ****************************************

module.exports.updatereview = async (req, res) => {
  const { recipient_email, feedback } = req.body;
  try {
    // Find the user who is the recipient of the review
    const recipient = await User.findOne({ email: recipient_email });

    // Find the user who is the reviewer of the review
    const reviewer = await User.findById(req.params.id);

    // Create a new review object with feedback and the reviewer and recipient information
    const review = await Review.create({
      review: feedback,
      reviewer,
      recipient,
    });

    // Check if the review string is empty
    const reviewString = review.review.trim();
    if (reviewString === "") {
      // If the review string is empty, show an error message and redirect to the previous page
      req.flash("error", `Feedback section can't be empty!`);
      return res.redirect("back");
    }

    // Add the new review object to the recipient's "reviewsFromOthers" array
    await recipient.updateOne({
      $push: { reviewsFromOthers: review },
    });

    // Remove the recipient from the reviewer's "assignedReviews" array
    await reviewer.updateOne({
      $pull: { assignedReviews: recipient.id },
    });

    // Show a success message and redirect to the previous page
    req.flash("success", `Successfully submitted the review!`);
    return res.redirect("back");
  } catch (err) {
    // If there is an error, log it and redirect to the previous page
    console.log("error", err);
    return res.redirect("back");
  }
};

module.exports.assignreview = async (req, res) => {
  const { recipient_email } = req.body;
  try {
    if (req.isAuthenticated()) {
      // Find the user who is the reviewer of the review
      const reviewer = await User.findById(req.params.id);

      // Find the user who is the recipient of the review
      const recipient = await User.findOne({ email: recipient_email });

      // Check if the recipient is already assigned to the reviewer
      const alreadyAssigned = reviewer.assignedReviews.filter(
        (userId) => userId == recipient.id
      );
      if (alreadyAssigned.length > 0) {
        // If the recipient is already assigned, show an error message and redirect to the home page
        req.flash("error", `Review is assigned already!`);
        return res.redirect("/");
      }

      // Add the recipient to the reviewer's "assignedReviews" array
      await reviewer.updateOne({
        $push: { assignedReviews: recipient },
      });

      // Show a success message and redirect to the home page
      req.flash("success", `review successfully assigned!`);
      return res.redirect("/");
    } else {
      // If the user is not authenticated, show an error message
      req.flash("error", `Error in assigning the review`);
    }
  } catch (err) {
    // If there is an error, log it
    console.log("error: ", err);
  }
};
