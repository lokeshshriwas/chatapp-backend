const cloudinary = require('cloudinary').v2;
          
cloudinary.config({ 
  cloud_name: 'dyz3bjoga', 
  api_key: '686521218941472', 
  api_secret: 'HlFyqeW7MHowGG3KjB_RblZwlt0' 
});

module.exports = {cloudinary}