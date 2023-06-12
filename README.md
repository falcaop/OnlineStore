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
  
  
  ## 4. Test Plan
  
  
  ## 5. Test Results
  
  
  ## 6. Build Procedures

  ### 6.1. Installation

  1. Make sure that you have version 18 or superior of [Node.js](https://nodejs.org/) installed in your system
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
  5. In the root directory, create a file called `.env` and paste the following content into it:
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
  ```

  ### 6.2 Execution

  1. Start the server process with the following command:
  ```bash
  npm start
  ```
  2. If running a development build, you need to also start the client process with the following command:
  ```bash
  npm run dev
  ```
  
  ## 7. Problems
  
  
  ## 8. Comments
