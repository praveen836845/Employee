const Review = require('../models/review');
const User = require('../models/user');

module.exports.home =async(req,res)=>{
   
        {
          let users = await User.find({}).populate('username');
          if(req.isAuthenticated() && req.user.role === 'admin'){
            return res.redirect('/dashboard');
          }
          else if (req.isAuthenticated() && !(req.user.role === 'admin')) {
            return res.redirect(`employee-dashboard/${req.user.id}`);
          }
          let data = res.render('signin', {
            title: 'Employess',
            users: users,
          })
          return data;
        }
}
module.exports.signup =async (req,res)=>{
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return res.redirect('/admin-dashboard');
      }
      else if (req.isAuthenticated() && !(req.user.role === 'admin')) {
        return res.redirect(`employee-dashboard/${req.user.id}`);
      }
      else return res.render('signup', {
        title: 'Review system | SignUp',
       });
}

module.exports.dashboard =async (req,res)=>{
    {
        {
          let users = await User.find({}).populate('username');
          let data = res.render('dashboard', {
            title: 'Dashboard',
            users: users,
          })  
          return data;
        }
      }
}
module.exports.signin =async (req,res)=>{
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return res.redirect('/dashboard');
      }
      else if (req.isAuthenticated() && !(req.user.role === 'admin')) {
        return res.redirect(`employee-dashboard/${req.user.id}`);
      }
      else return res.render('signin', {
        title: 'Review system | SignIn',
     });
}
module.exports.signout = async (req,res)=>{
    req.logout((err) => {
        if (err){
          return next(err);
        }
        req.flash('success', 'Successfully Logged out!');
        return res.redirect('/');
      });
}
module.exports.adminpannel=async(req,res)=>{
    try {
        if (req.isAuthenticated() && req.user.role === 'admin') {
          
            let users = await User.find({}).populate('username');
            let filteredUsers = users.filter(
              (user) => user.email !== req.user.email
            );
    
            return res.render('dashboard_admin', {
              title: 'Admin panel',
              users: filteredUsers,
            });
        } 
        else if (req.isAuthenticated() && !(req.user.role === 'admin')) {
            return res.redirect('back');
        } 
        else {
          return res.redirect('/');
        }
      } catch (err) {
        console.log(err);
        return res.redirect('/');
      }
}

module.exports.employeepannel=async(req,res)=>{
    try {
        if (req.isAuthenticated()) {
          const employee = await User.findById(req.params.id)
            .populate({
              path: 'reviewsFromOthers',
              populate: {
                path: 'reviewer',
                model: 'User',
              },
            })
            .populate('assignedReviews');
    
          const reviewsFromOthers = employee.reviewsFromOthers;
          const assignedReviews = employee.assignedReviews;
          const populatedResult = await Review.find().populate({
            path: 'reviewer',
            model: 'User',
          });
    
          let data = res.render('employee_dashboard', {
            title: 'Employee panel',
            employee,
            assignedReviews,
            reviewsFromOthers,
          });
          return data;
        } else {
          return res.redirect('/');
        }
      } catch (err) {
        console.log(err);
        return res.redirect('back');
      }
}

module.exports.addemployee= async(req,res)=>{
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return res.render('add_employee', {
          title: 'Add Employee ',
        });
    }
    if(req.isAuthenticated() && !(req.user.role === 'admin')){
        return res.redirect('/');
    }
    else {
      return res.redirect('/');
    }
}

module.exports.editemployee = async (req,res)=>{
    try {
        if (req.isAuthenticated() && req.user.role === 'admin') {      
            const employee = await User.findById(req.params.id).populate({
              path: 'reviewsFromOthers',
              populate: {
                path: 'reviewer',
                model: 'User',
              },
            });
            const reviewsFromOthers = employee.reviewsFromOthers;
            return res.render('employee_edit', {
              title: 'Employee-Edit',
              employee,
              reviewsFromOthers,
            });
        }
        else return res.redirect('/');
      } catch (err) {
        console.log('error', err);
        return res.redirect('back');
      }
}
module.exports.updateemployee = async (req,res)=>{
    try {
        const employee = await User.findById(req.params.id);
        const { username, role } = req.body;
    
        if(employee){
          employee.username = username;
          employee.role = role;
          employee.save(); 
    
          req.flash('success', 'Updated employee details!');
          return res.redirect('back');
        }
        else {
          req.flash('error', 'This employee is not found!');
          return res.redirect('back');
        }
      } catch (err) {
        console.log('error', err);
        return res.redirect('back');
      }
}

module.exports.createuser = async(req,res)=>{
    try {
        const { username, email, password, confirm_password, role } = req.body;
    
        if(password === confirm_password){
          User.findOne({ email }, async (err, user) => {
            if (err) {
              console.log('User not found in signing up');
              return;
            }
      
            if (!user) {
              await User.create(
                {
                  email,
                  password,
                  username,
                  role,
                },
                (err, user) => {
                  if (err) {
                    req.flash('error', "Sign Up failed");
                  }
                  req.flash('success', 'Successfully created an account!');
                  return res.redirect('/');
                }
              );
            } else {
              req.flash('error', 'User already registed!');
              return res.redirect('back');
            }
          });
        }
    
        else {
          req.flash('error', 'Password and Confirm password did\'nt matched');
          return res.redirect('back');
        }
      } catch (err) {
        console.log('error', err);
        return res.redirect('back');
      }
}

module.exports.createemployee = async  (req,res)=>{
    try {
        const { username, email, password, confirm_password } = req.body;
    
        if(password === confirm_password){
          User.findOne({ email }, async (err, user) => {
            if (err) {
              console.log('User not found in signing up');
              return;
            }
      
            if (!user) {
              await User.create(
                {
                  email,
                  password,
                  username,
                },
                (err, user) => {
                  if (err) {
                    req.flash('error', "Error in adding employee");
                  }
                  req.flash('success', 'Employee added!');
                  return res.redirect('/admin-dashboard');
                }
              );
            } else {
              req.flash('error', 'Employee exist!');
              return res.redirect('back');
            }
          });
        }
    
        else {
          req.flash('error', 'Password and Confirm password did\'nt matched');
          return res.redirect('back');
        }
      } catch (err) {
        console.log('error', err);
        return res.redirect('back');
      }
}

module.exports.destroy = async (req,res)=>{
    try {
        const { id } = req.params;
        const user = await User.findById(id);
    
        await Review.deleteMany({ recipient: id });
    
        await Review.deleteMany({ reviewer: id });
    
        await User.findByIdAndDelete(id);
    
        req.flash('success', `User and associated reviews deleted successfully!`);
        return res.redirect('back');
      } catch (err) {
        console.log('error', err);
        return res.redirect('back');
      }
}
module.exports.updatereview= async (req,res)=>{
    const { recipient_email, feedback } = req.body;
    try {
      const recipient = await User.findOne({ email: recipient_email });
      const reviewer = await User.findById(req.params.id);
  
      const review = await Review.create({
        review: feedback,
        reviewer,
        recipient,
      });
  
      const reviewString = review.review.trim();
  
      if (reviewString === '') {
        req.flash('error', `Feedback section can't be empty!`);
        return res.redirect('back');
      }
  
      await recipient.updateOne({
        $push: { reviewsFromOthers: review },
      });
  
      await reviewer.updateOne({
        $pull: { assignedReviews: recipient.id },
      });
  
      req.flash('success', `Successfully submitted the review!`);
      return res.redirect('back');
    } catch (err) {
      console.log('error', err);
    }
}
module.exports.assignreview=async (req,res)=>{
    const { recipient_email } = req.body;
    try {
      if (req.isAuthenticated()) {
        const reviewer = await User.findById(req.params.id);
        const recipient = await User.findOne({ email: recipient_email });
        const alreadyAssigned = reviewer.assignedReviews.filter(
          (userId) => userId == recipient.id
        );  
        if (alreadyAssigned.length > 0) {
          req.flash('error', `Review is assigned already!`);
          return res.redirect('/');
        } 
        await reviewer.updateOne({
          $push: { assignedReviews: recipient },
        });
  
        req.flash('success', `review successfully assigned!`);
        return res.redirect('/');
      } else {
        req.flash('error', `Error in assigning the review`);
      }
    } catch (err) {
      console.log('error: ', err);
    }
}