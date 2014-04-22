Project Lorax

Project Lorax monitors the soil moisture level for your plants. If the soil moisture readings are below a certain level, the app will send you a tweet notification to remind you to water your plant. The client-layer is built using NodeJS and Express as the server side and BackboneJS framework for the front-end view and MongoDB is used as a database. 


Inspiration for the Project:
Raspberry Pi is a credit card-sized computer that can be used with various sensors, LEDs and other simple hardware components to build relatively simple projects. I had an interest in building a project using a Raspberry Pi because I wanted to build a web application that interacts with the physical world. 
I got the idea for the project as I thought about the plants I had neglected during the 12-week immersive course and wondered what plants would say if they could speak.

Design Process:
The hardware component was a challenge because it was outside of our area of expertise. We spent the first couple of days setting up the Raspberry Pi and the analogue soil moisture sensor to measure the data properly. However, with resilience and trial-and-error, the hardware component was set up to read the soil moisture data and send the data to the server. 


In a typical project of similar scale, it would make sense to have a single server handle data and client interaction. However, we wanted to experiment with setting up separate servers to handle the data collection and the client interaction separately. We also decided to go away from Ruby on Rails server and decided to take on the challenge of learning how to build this project using NodeJS, a server-side application written in JavaScript, and Express. 
As you can see in the diagram below, the service-layer server handles the data-related logic using the PostgreSQL database. The client-layer server handles the client interaction through the browser, data logic to send a twitter notification and requests to the service-layer for appropriate data. The client-layer server stores client information in the MongoDB database. 

![ScreenShot](http://i.imgur.com/DARkd14.png)

Technology
This application is built using the Raspbery Pi, soil moisture sensor, ChartJS, NodeJS, Express, PostgreSQL, MongoDB, BackboneJS

