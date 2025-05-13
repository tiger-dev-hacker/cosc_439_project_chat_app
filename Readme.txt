Readme 

To run this chat app

1. Install the required dependencies.
2. Open three Powershell/command prompt windows 
	i. On one do cd frontend and run npm start
	ii. On the second one do cd backend  and npm start
	iii. On the third one do cd file_sharing_server and node server.js


Seed users to test application (new users can be created and logged in as well)

1. email:- john@example.com password:- johndoe
2. email:- jane@example.com password:- janedoe
3. email:- guest@example.com password :- 123456

3. After running step 2, open two or more incognito windows, either signup  to create new users or login using seed users. After entering the logging credentials, refresh the page and you will be logged into an account. You can test both one-to-one and group chat by searching up users or with existing users or chats
 For testing group chats, open 3 or more incognito windows. A new group chat can also be created but it will need minimum three users.

4. For file sharing between two clients, select either the send file or receive file button based on your role. Once, both sending and receiving windows are open, a random code will be generated on the sender side. Input that code into the receiver side and you will see that both the sender and receiver will have similar UI with sender allowing to input files. 
- Once you input a file, you should a blob object being automatically downloaded on the receiver side. 