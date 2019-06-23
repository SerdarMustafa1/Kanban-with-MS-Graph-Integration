kanban server# current-kb-server

Express Server runing on port 3000. With CRUD queries for PSQL.

To use:

1. Clone to your desired directory

2. npm install

3. Run server by using node .


* If your using a MAC then you can run the server in the background even with your machine shutdown, by using a screen - More details available here: https://linuxize.com/post/how-to-use-linux-screen/

 * To use the plans input option available in the settings menu, you will need to first create a Postgres database and appropriate table. 

 E.g. 

 Create Table = CREATE DATABASE fooBAR;

 INSERT INTO plans (plan_id, plan_name, bar_color, checkbox_state)
VALUES ('hSgeX83WkOeZLY20LbTLpYABb4H', 'PLN', '#998fff', 'true'), ('XdnK89LVekSaz1TZZa_gIpYAH0g4', 'bluebox', '#ff7c24', 'true'), ('U0g4dV6A0SALV9UYz1OJpYAAa2e', 'BLUE', '#ff6938', 'true');


The DB will store the plan name, ID and Bar color for each plan and feedthem back to the front end using the existing REST API.