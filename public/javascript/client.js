loraxApp.Models.Plant = Backbone.Model.extend({
  idAttribute: "_id",
  //return url for when we save a model
  url:'/api/plants'
});

loraxApp.Collections.PlantCollection = Backbone.Collection.extend({
  model: loraxApp.Models.Plant,
  //grabs all plants for current user
  url:"/api/plants"
});

loraxApp.Models.CurrentUser = Backbone.Model.extend({
  //grabs current user
  url: "/current",
  initialize: function(){
    this.fetch();
  }
});

loraxApp.Views.SignupView = Backbone.View.extend({
  render: function(){
    var that = this;
    if(this.template){
      var html = this.template(this.model.attributes);
      this.$el.html(html);
    } else {
      $.get("/signup_template").done(function(template){
        var Template = Handlebars.compile(template);
        var html = Template({message: ""});
        that.$el.html(html);
      });
    }
    return this;
  }
});

loraxApp.Views.LoginView = Backbone.View.extend({
  render: function(){
    var that = this;
    if(this.template){
      var html = this.template(this.model.attributes);
      this.$el.html(html);
    } else {
      $.get("/login_template").done(function(template){
        var Template = Handlebars.compile(template);
        var html = Template({message: ""});
        that.$el.html(html);
      });
    }
    return this;
  }
});

loraxApp.Views.ProfileView = Backbone.View.extend({
  initialize: function(){
    this.listenTo(this.model, "change", this.render);
  },
  render: function(){
    var that = this;
    if(this.template){
      var html = this.template(this.model.attributes);
      this.$el.html(html);
    } else {
      $.get("/profile_template").done(function(template){
        that.template = Handlebars.compile(template); 
        var html = that.template(that.model.attributes);
        that.$el.html(html);
     });
    }
    return this;
  }
});

loraxApp.Views.PlantDetailView = Backbone.View.extend({
  className:"chart",
  events: {
    "click a":"backToProfile"
  },
  render: function(){
    var that = this;
    if(this.template){
      var html = this.template(this.model.attributes);
      this.$el.html(html);
    } else {
      console.log(that.model);
      $.get("/api/plant_detail_template").done(function(template){
        var Template = Handlebars.compile(template);
        var html = Template(that.model.attributes);
        that.$el.html(html);//not on the page yet
      });
    }
    return this;
  },
  backToProfile: function(){
    // clearInterval(update_graph);
  },
  data: function(){
    var that = this;
    $.get("/profile/plantdata/"+that.model.attributes.pi_serial_id+"/"+that.model.attributes.sensor_id).done(function(res){
        var redline = that.model.attributes.redline;
          var parsedData = JSON.parse(res);
          var readings=[];
          var redlineVal=[];
          var timestamp=[];
          _.each(parsedData.rows, function(result){
            readings.push(result.reading); //creating an array of soil moisture reading
            timestamp.push(result.recordtime); //creating an array of timestamp at each reading
            redlineVal.push(redline);      //creating an array of redline constant
          });
          var data = {
            labels : timestamp,
            datasets: [
            { fillColor : "rgba(151,187,205,0.5)",
              strokeColor : "rgba(151,187,205,1)",
              pointColor : "rgba(151,187,205,1)",
              pointStrokeColor : "#fff",
              data: readings
            },
            { fillColor : "rgba(220,220,220,0)",
              strokeColor : "rgba(255,0,0,1)",
              pointColor : "rgba(255,0,0,1)",
              pointStrokeColor : "#fff",
              data: redlineVal
            }
            ]
          };
         that.graph(data);
        });
      
    return this;
    },

  graph: function(data){
    var that = this;
    var chart_canvas = that.el.querySelector(".soilMoistChart");
    var ctx = chart_canvas.getContext("2d");
    
    var optionsNoAnimation = {animation : false};
    var chart = chart || new Chart(ctx).Line(data, optionsNoAnimation);
    return this;
    }
});



loraxApp.Views.PlantView = Backbone.View.extend({
  className: "plant-container",
  events: {
    "click .plant" : "detail"
  },
  render: function(){
    var that = this;
    if(this.template){
      var html = this.template(this.model.attributes);
      this.$el.html(html);
    } else {
      $.get("/api/plant_template").done(function(template){
        var Template = Handlebars.compile(template);
        var html = Template(that.model.attributes);
        that.$el.html(html);
      });
    }
    return this;
  },
  detail: function(){
    var path = "profile/"+this.model.attributes._id;
    var detailView = new loraxApp.Views.PlantDetailView({ model: this.model });
      $('.plants').html(detailView.render().el);
      detailView.data();
      update_graph = setInterval(function(){
        detailView.data();
      }, 10000);
        loraxApp.router.navigate(path);
  }
});

loraxApp.Views.PlantCollectionView = Backbone.View.extend({
  intialize: function(){
    this.listenTo(this.collection, "reset", this.render);
  },
  className: "plants",
  render: function(){
    this.$el.html("");
    this.collection.each(function(plant){
      var plantView = new loraxApp.Views.PlantView({ model: plant });
      this.$el.append(plantView.render().el);
    }, this);
    return this;
  }
});

loraxApp.Views.NewPlantFormView = Backbone.View.extend({
  className: "plant-form",
  events: {
    "click .plus": "renderForm"
  },
  render: function(){

    this.$el.html("<div class=\"plus\"></div>");
    return this;
  },
  renderForm: function(){
    var current_user = new loraxApp.Models.CurrentUser();
    var newPlantView = new loraxApp.Views.NewPlantView({ model: current_user });
    this.$el.html(newPlantView.render().el);
  }
});

loraxApp.Views.NewPlantView = Backbone.View.extend({
  events: {
    "submit": "create"
  },
  render: function(){
    var that = this;
    if(this.template){
      var html = this.template;
      this.$el.html(html);
    } else {
      $.get("/api/new_plant_template").done(function(template){
        var Template = Handlebars.compile(template);
        var html = Template();
        that.$el.html(html);
      });
    }
    return this;
  },
  create: function(event){
    event.preventDefault();
    console.log(event);
    //we're getting the values of the form from the submission event
    var name = event.target[0].value;
    var serial = event.target[2].value;
    var sensor = event.target[3].value;
    // var redline = event.target[4].value;
    var redline;
    var type = event.target[1].value;
    switch(type)
    {
      case "Cactus or Succulent": // plant1 is "Cactus or Succulent" on the form
        redline = 1000;
        break;
      case "Leafy Plant": // plant2 is "Leafy Plant" on the form
        redline = 750;
        break;
      case "Flowering Plant": // plant3 is "Flowering Plant"
        redline = 850;
        break;
      case "Fruit Bearing Plant": // plant4 is "Fruit Bearing Plant"
        redline = "900";
        break;
      default: // default redline is 700
        redline = 700;
    }
    var owner_id = this.model.attributes._id;
    //logging the values to check 
    console.log(name);
    console.log(type);
    console.log(serial);
    console.log(sensor);
    console.log(redline);
    console.log(owner_id);
    //creating an object to hold all the values so we can easily create a new plant
    var data = {
      pi_serial_id: serial,
      sensor_id: sensor,
      redline: redline,
      nickname: name,
      owner_id: owner_id,
      plant_type: type
    };
    // console.log(data);
    //this is where the backbone model is created
    var plant = new loraxApp.Models.Plant(data);
    plant.isNew();
    plant.save();
   //this post sends data to a local express route which then posts to the service layer
    $.post("register/"+owner_id+"/"+serial+"/"+sensor+"/"+redline).done(function(){
      console.log("success!");
    // trying to trigger reroute to profile
      loraxApp.router.profile();
   });
  }
});

loraxApp.Routers.Main = Backbone.Router.extend({
  routes: {
    "": "index",
    "login" : "login",
    "profile": "profile",
    "profile/:id":"detail"
  },
  index: function(){
    
  },
  login: function() {
    var view = new loraxApp.Views.LoginView();
    $("body").html(view.render().el);
  },
  profile: function() {
    console.log("profile view");
    var current_user = new loraxApp.Models.CurrentUser();
    var view = new loraxApp.Views.ProfileView({model: current_user});
    $(".app").html(view.render().el);

    var garden = new loraxApp.Collections.PlantCollection();
    garden.fetch({
      success: function(){
      var gardenView = new loraxApp.Views.PlantCollectionView({ collection: garden });
      $(".app").append(gardenView.render().el);
      console.log(garden);
      if (garden.length < 8){
        // plus sign should appear here. when the plus sign is clicked render the newPlantView
        console.log("the plus div was appended");
        var newPlantFormView = new loraxApp.Views.NewPlantFormView();
        $(".plants").append(newPlantFormView.render().el);
      }
    }
  });
  },
  detail: function(id){
    console.log("detail view");
    console.log(id);
    var current_user = new loraxApp.Models.CurrentUser();
    var view = new loraxApp.Views.ProfileView({model: current_user});
    $(".app").html(view.render().el);

    var garden = new loraxApp.Collections.PlantCollection();
    garden.fetch({
      success: function(){
      var gardenView = new loraxApp.Views.PlantCollectionView({ collection: garden });
      console.log("the garden",garden);
      var a_model = garden.findWhere({ _id: id });

      console.log(a_model,"the model");
      var detailView = new loraxApp.Views.PlantDetailView({ model: a_model });
      $(document).ready( function(){
        $('.app').append("<div class='plants'></div>");
        $('.plants').append(detailView.render().el);
        detailView.data();
        update_graph = setInterval(function(){
          detailView.data();
        }, 10000);});
      }
    });

  }
});




