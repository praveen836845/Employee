const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const Review = require('../models/review');
router.use('/review', require('./reviwes'));
const controller =require('../controllers/controller');

router.get('/', controller.home);
router.get('/sign-up', controller.signup);
router.get('/sign-in', controller.signup);
router.get('/dashboard', controller.dashboard);
router.get('/sign-out', controller.signout);
router.get('/admin-dashboard', controller.adminpannel);
router.get('/employee-dashboard/:id', controller.employeepannel);
router.get('/add-employee', controller.addemployee);
router.get('/edit-employee/:id', controller.editemployee);
router.post('/update-employee/:id', controller.updateemployee);
router.post('/create', controller.createuser);
router.post('/create-employee', controller.createemployee);
router.get('/destroy/:id', controller.destroy)

router.post('/update-review/:id', controller.updatereview)
router.post('/assign-review/:id', controller.assignreview);

router.post('/create/:id', async (req,res)=>{
  try {
    const { feedback } = req.body;
    const reviewToBeUpdated = await Review.findById(req.params.id);

    if (!reviewToBeUpdated) {
      req.flash('error', 'Review can\'t found!');
    }

    reviewToBeUpdated.review = feedback; 
    reviewToBeUpdated.save(); 
    req.flash('success', 'Successfully updated review!');
    return res.redirect('back');
  } catch (err) {
    console.log(err);
  }
});
router.post(
  '/create-session',
  passport.authenticate('local', { failureRedirect: '/' }),
  async (req,res)=>{
    req.flash('success', 'Successfully Logged in');
  if (req.user.role === 'admin') {
    return res.redirect('/dashboard');
  }
  else return res.redirect(`/employee-dashboard/${req.user.id}`);
  }
);



module.exports = router;
  