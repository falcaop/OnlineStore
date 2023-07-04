# Project Report

Grupo:  

  - Luís Eduardo de Brito Câmara
    - NUSP: 12690282
  
  - Pedro Falcão Rocha
    - NUSP: 12692408
  
  - Rogério Lopes Lube
    - NUSP: 10770113
  
  ## 1. Requirements
  
  - The system must have 2 types of users: Clients and Administrators
  
    - Administrators are responsible for registering/managing administrators, customers, and products/services provided. The application already comes with an account admin with password admin.
  
    - Customers are users who access the system to buy products/services.

  - The admin record includes, at least: name, id, phone, email.

  - Each customer's record includes, at least: name, id, address, phone, email

  - Product/services records include, at least: name, id, photo, description, price, quantity (in stock), quantity sold.
  
  - Your store may sell products, services or both (you decide)

  - Selling Products (or services): Products are selected, their quantity chosen, and are included in a cart. Products are purchased using a credit card number (any number is accepted by the system). The quantity of product sold is subtracted from the quantity in stock and added to the quantity sold. Carts are emptied only on payment or by customers.

  - Product/Service Management: Administrators can create/update/read/delete (crud) new products and services. For example, they can change the stock quantity.

  - Your functionality: Create a functionality that is specific to your application. It does not have to be something complicated. For instance, if you are selling cars, you may allow users to use an accelerator to hear how each car engine roars up and down.   

  - The system must provide accessibility requirements and provide good usability. The system must be responsive, meaning that it should complete assigned tasks within a reasonable time.

  ## 2. Project Description
  
The project consists of a website for a clothing store.

For administrators, the website allows for the creation, editing, and removal of available products, as well as the creation, editing, and removal of other users (customers and administrators).

For customers, the website allows for the viewing of available products, searching by name, categories, and other filters, selecting the desired quantity of the product, adding products to the shopping cart, and completing the purchase.

Extra functionality: The website also allows the customer to create their own t-shirt by uploading an image as a print, enabling a preview of the customized t-shirt.

### 2.1 Diagrams
To see how users navigate the website, two navigation diagrams were created, one for customers and one for administrators. The diagrams represents the sequences of pages accessed in the main operations of the website. The pages can also be accessed using the navigation menus.
#### 2.1.1 Administrators
![Administrators navigation diagram](https://cdn.discordapp.com/attachments/1104219266162642996/1104854991711256647/administrador.png)

#### 2.1.2 Customers
![Customers navigation diagram](https://cdn.discordapp.com/attachments/1104219266162642996/1104854991493148692/cliente.png)

The diagram shows the pages organized to represent the sequences of pages accessed in the main operations of the website. The pages can also be accessed using the navigation menus.

Furthermore, there were developed medium to high fidelity mockups for all major app screens. These can be found [here](https://www.figma.com/file/iVZQMGcoJsFiGn5aPwzvxx/Prototipos?type=design&node-id=1%3A14&t=P3IddQNjZLe303y2-1).
  
  ## 3. Comments About the Code
  This project was developed using the JavaScript framework [Vue 3](https://vuejs.org/) together with the build tool [Vite](https://vitejs.dev/) to build the user interface, the server engine [Node.js](https://nodejs.org/) along with the [Express](https://expressjs.com/) framework to run the API, and the NoSQL database service [MongoDB](https://www.mongodb.com/) together with the [Mongoose](https://mongoosejs.com/) library to store long term data.
  
  The project structure is organized into the following main sections:
  - **/src/assets:** files that can be imported througout the code whenever necessary
  - **/src/components:** pieces of user interface that can be used by multiple pages
  - **/src/router/index.js:** The code that dictates which URL path routes to each page
  - **/src/views:** The pages that can be accessed through URL routes
  - **/src/App.vue:** The basic structure of the website with its fixed parts and the space the pages should occupy
  - **/server:** General backend functionality
  - **/server/api.js:** Available API endpoints
  - **/server/db:** Database connection and settings

  The user interface was designed to be fully responsive to a wide range of screen sizes.

  For the purpose of facilitating the testing and reviewing of this project we have provided a test MongoDB database dump at `./testdbarchive` with sample data about products, users, purchases, and so on, to be cloned together with the rest of the repository, to import it navigate to this repository on your terminal and run the following command:
  ```bash
  mongorestore --archive="testdbarchive" --drop
  ```
  This way the interface will already be populated with dynamic data when you first run it on your machine and you will have a more authentical experience of what the system is actually supposed to look like.

  Most importantly, this includes an administrator user with login `admin` and password `admin`, and a customer user with login `user@user.com` and password `user!ABC123`. We recommend using these to test the system functionalities more thoroughly.
  
  ## 4. Test Plan
  To verify that the website is properly functioning, some manual tests will be performed on the main functionalities on situations where they successfully occur and on situations where there may be an error. The tests to be performed are listed below.
- Customer:

1. Create Account
    - Invalid input
    - Success
2. Login
    - Invalid input
    - Success
3. View category
4. Search
    - Order by
    - Filter by price
    - FIlter by category
5. Add product to cart
6. Customize
7. Complete purchase
8. See purchase
9. Edit personal information  
    - Invalid input
    - Success
10. Logout
11. Access to pages
    - Admin page

- Admin:
12. Create product
    - Invalid input
    - Success
13. Update product
    - Invalid input
    - Success
14. Remove product
15. Create user
    - Invalid input
    - Success
16. Update user
    - Invalid input
    - Success
17. Remove user

- Not Logged In:
18. Access to pages:
    - Admin pages
    - User pages
  
  ## 5. Test Results
  The results of the tests can be seen below.

- Customer:
1.
    - Cannot submit form if input is not in expected format, alert details invalid input.
    - Alert informs that the user was created successfully, redirected to the account page.
2.
    - Alert informs wrong email address or password.
    - Logged in successfully, redirected to the account page.
3. All products displayed are from the selected category.
4. 
    - All of the sorting methods work properly.
    - Only products in the selected price range are displayed.
    - Only products from the selected category are displayed.
5. Alert informs the user that the product was successfully added to the cart. “Add to cart” button becomes unavailable.
6. Image preview properly changes based on color selected and file URL.
7. Alert informs the user that the purchase was successfully completed.
8. Products and customized shirts from the selected purchase are displayed.
9. 
    - Cannot submit form if input is not in expected format, alert informing invalid input.
    - Alert informs that the personal information was successfully updated.
10. Successfully logged out, icons on menu are changed from user and logout to login.
11.
    - Redirected to 404 Page not found

- Admin:
12. 
    - Cannot submit form if input is not in expected format, alert informing invalid input.
    - Alert informs that the product was successfully added.
13.
    - Cannot submit form if input is not in expected format, alert informing invalid input.
    - Alert informs that the product was successfully updated.
14. Alert informs the administrator that the product was successfully removed.
15. 
    - Cannot submit form if input is not in expected format, alert informing invalid input.
    - Alert informs that the user was successfully added.
16.
    - Cannot submit form if input is not in expected format, alert informing invalid input.
    - Alert informs that the user was successfully updated.
17. Alert informs the administrator that the user was successfully removed. 

- Not Logged In:
18.
    - Redirected to Login
    - Redirected to Login

  
  ## 6. Build Procedures

  ### 6.1. Installation

  1. Make sure that you have version 18 or superior of [Node.js](https://nodejs.org/) and MongoDB installed in your system
  2. Clone the repository to your preferred location with the following command:
  ```bash
  git clone https://github.com/falcaop/OnlineStore.git
  ```
  3. Move the terminal to the directory created for the repository with the following command:
  ```bash
  cd OnlineStore
  ```
  4. Install the necessary dependencies with the following command:
  ```bash
  npm i
  ```
  5.
  - If you wish to use the test database, load it from the file _testdbarchive_ using the command mongorestore
  ```bash
  mongorestore --archive="testdbarchive"
  ```
  - You could also access MongoDB Shell, create a new database named "nova" and initialize it, with the following comands:
  ```bash
  mongosh
  ```
  ```bash
  use nova
  ```
  ```bash
  db.collections.insert({})
  ```
  6. In the root directory, create a file called `.env` and paste the following content into it:
  ```env
  # Can be either "development" or "production"
  # If you use "development" you will need to manually start the client with `npm run dev`
  # Only use "production" after creating the production build with `npm run build`
  NODE_ENV="development"
  # The base URL the client will use to make requests to the API
  VITE_API_HOST="http://localhost:3000"
  # Only used for production builds to start the client listener
  CLIENT_PORT="8080"
  # The port from which the API should listen for requests
  API_PORT="3000"
  # The connection URI to the MongoDB database created for this project
  MONGOURL="mongodb://localhost:27017/nova"
  ```

  ### 6.2 Execution

  1. Start the server process with the following command:
  ```bash
  npm start
  ```
  2. If running a development build, open a new terminal window and start the client process with the following command:
  ```bash
  npm run dev
  ```
  
  ## 7. Problems

  An efficient solution to save the images of the custom shirts added by the user to the shopping cart has not been found. Since the shopping cart is saved on the client side, it doesn't make much sense to save the images on the server, especially considering that they can be altered or removed from the cart. Additionally, we haven't found a way to save the images on the client side in the long term. Therefore, we have decided to let the user input an image URL, instead of uploading a file.
  
  ## 8. Comments

  No comments.
