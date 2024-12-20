//<!--22021332d Chan Hei-->
//<!--22020839d Wong Sing Ho Samuel-->
import fs from 'fs/promises';
import client from './dbclient.js';
import { GridFSBucket} from 'mongodb';
import { Readable } from 'stream';
import crypto from 'crypto';

const users = client.db('4432-project').collection('user');
const event = client.db('4432-project').collection('event');
const tokens = client.db('4432-project').collection('token');
const transaction = client.db('4432-project').collection('transaction');
const gridFSBucket = new GridFSBucket(client.db('4432-project'));
async function init_db() {
  try {
    const existingUser = await users.findOne();
    if (!existingUser) {
      const userData = await fs.readFile('user.json', 'utf-8');
      const usersDataArray = JSON.parse(userData);
      const result = await users.insertMany(usersDataArray);
      console.log(`Added ${result.insertedCount} users`);
    }
    const existingEvent = await event.findOne();
    if (!existingEvent) {
      const eventData = await fs.readFile('event.json', 'utf-8');
      const eventsDataArray = JSON.parse(eventData);
      const result = await event.insertMany(eventsDataArray);
      console.log(`Added ${result.insertedCount} event(s) to the database`);
    }
    const existingToken = await tokens.findOne();
    if (!existingToken) {
      const tokenData = await fs.readFile('token.json', 'utf-8');
      const tokenDataArray = JSON.parse(tokenData);
      const result = await tokens.insertMany(tokenDataArray);
      console.log(`Added ${result.insertedCount} token(s) to the database`);
    }
    const existingTransaction = await transaction.findOne();
    if (!existingTransaction) {
      const transactionData = await fs.readFile('token.json', 'utf-8');
      const transactionDataArray = JSON.parse(transactionData);
      const result = await transaction.insertMany(transactionDataArray);
      console.log(`Added ${result.insertedCount} token(s) to the database`);
    }
  } catch (err) {
    console.error('Unable to initialize the database:', err);
  }
}
async function validate_user(username, password) {
  await sha256(password).then(hash => {
    password = hash;});
  try {
    const currentDate = new Date();
    await users.updateOne({username:username},{$set:{loginattempt:currentDate}});
    if (!username || !password) {
      return false;
    }
    const user = await users.findOne({ username : username,password: password });
    if (user) {
      return user;
    } else {
      return false;
    }
  } catch (err) {
    console.error('Unable to fetch from database:', err);
    return false;
  }
}
async function update_user(username, password, nickname, gender, birthday, profileImage,uid,email) {
  const user = await users.findOne({ username : username })
  var temp = password;
  if(user){
    const currentDate = new Date();
    await users.updateOne({username:username},{$set:{change:currentDate}});
    if(user.password != temp){
      await sha256(temp).then(hash => {
        password = hash;
      });
    }
    else{
      password = user.password;
    }
  }else{
    await sha256(password).then(hash => {
        password = hash;
      });
  }
  

  try {
    const result = await users.updateOne(
      { username },
      { $set: { password:password, nickname: nickname, gender: gender, birthday: birthday, uid:uid, email:email } },
      { upsert: true }
    );

    if (result.upsertedCount === 1) {
      console.log('Added 1 user');
    } else {
      console.log('Added 0 users');
    }

    // Handle image upload using GridFS
    if (profileImage) {
      const readableStream = Readable.from(profileImage.buffer);
      const uploadStream = gridFSBucket.openUploadStream(username);
      readableStream.pipe(uploadStream);
      const fileId = uploadStream.id;
      await users.updateOne({ username }, { $set: { profileImageId: fileId } });
    }

    return true;
  } catch (err) {
    console.error('Unable to update the database:', err);
    return false;
  }
}
async function modify_user(username, password, nickname, gender, birthday, profileImage, uid,email){
  const user = await users.findOne({ uid : uid })
    var temp = password;
    const originalname = user.username;

    if(user){
      const currentDate = new Date();
      await users.updateOne({uid:uid},{$set:{change:currentDate}});
      if(user.password != temp){
        await sha256(temp).then(hash => {
          password = hash;
        });
      }
      else{
        password = user.password;
      }
    }else{
      await sha256(password).then(hash => {
          password = hash;
        });
    }
    try {
      await users.updateOne(
        { uid },
        { $set: { username:username, password:password, nickname: nickname, gender: gender, birthday: birthday, email:email} },
      );
      await transaction.updateMany(
        {username: originalname},
        {$set: {username:username}},
        { upsert: false }
      )
        
      // Handle image upload using GridFS
      if (profileImage) {
        const readableStream = Readable.from(profileImage.buffer);
        const uploadStream = gridFSBucket.openUploadStream(username);
        readableStream.pipe(uploadStream);
        const fileId = uploadStream.id;
        await users.updateOne({ username }, { $set: { profileImageId: fileId } });
      }
      return true;
    } catch (err) {
      console.error('Unable to update the database:', err);
      return false;
    }
}
async function fetch_user(username) {
  try {
    const user = await users.findOne({ username: username });//username:username
    return user;
  } catch (err) {
    console.error('Unable to fetch from database:', err);
    return null;
  }
}
async function username_exist(username) {
  try {
    const user = await fetch_user(username);
    return user !== null;
  } catch (err) {
    console.error('Unable to fetch from database:', err);
    return false;
  }
}
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);                    
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));             
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
async function update_event(eventName, bookedSeats) {
  try {
    const result = await event.updateOne(
      { eventname: eventName },
      { $set: { BookedSeat: bookedSeats } }
    );
    if (result.matchedCount === 1) {
      console.log('Updated seat occupation for event:', eventName);
      return true;
    } else {
      console.log('Event not found:', eventName);
      return false;
    }
  } catch (error) {
    console.error('Unable to update the database:', error);
    return false;
  }
}
async function validate_token(token) {
  try {
    const tempuser = await tokens.findOne({ token: token });
    if (tempuser) {
      const user = await users.findOne({ username: tempuser.username });
      if (user) {
        return user;
      } else {
        console.log('User not found for token:', token);
        return false;
      }
    } else {
      console.log('Token not found:', token);
      return false;
    }
  } catch (err) {
    console.error('Unable to fetch from database:', err);
    return false;
  }
}
async function update_token(username, token, password) {
  await sha256(password).then((hash) => {
    password = hash;
  });
  try {
    const result = await tokens.updateOne(
      { username: username },
      { $set: { password, token } },
      { upsert: true }
    );

    if (result.upsertedCount === 1) {
      console.log('Added/Updated token for user:', username);
      return true;
    } else {
      console.log('User not found:', username);
      return false;
    }
  } catch (error) {
    console.error('Unable to update the token:', error);
    return false;
  }
}
async function updatePassword(username, newPassword) {
  await sha256(newPassword).then(hash => {
    newPassword = hash;});
  try {
    const result = await users.updateOne(
      { username },
      { $set: {password:newPassword} },
      { upsert: false }
    );
    return true;
  } catch (err) {
    console.error('Unable to update the database:', err);
    return false;
  }
}
async function forgotPassword(username, birthday, nickname, newPassword) {
  try {
    // Fetch user data based on the provided username
    const userData = await fetch_user(username);

    // Check if the provided security answer matches the stored answer
    if (userData && userData.birthday === birthday && userData.nickname === nickname) {
      // Update the user's password with the new password
      await updatePassword(username,newPassword);
      return { status: 'success', message: 'Password reset successfully' };
    } else {
      return { status: 'error', message: 'Invalid security answer' };
    }
  } catch (error) {
    console.error('Error during password reset:', error);
    return { status: 'error', message: 'An error occurred during password reset' };
  }
}
async function update_transaction(username,date,eventname,price,seat,eventdate){
  try {
    const result = await transaction.insertOne({
      username,
      eventname,
      date,
      price,
      seat,
      eventdate
    });

    if (result.insertedCount === 1) {
      console.log('Added 1 transaction');
    } else {
      console.log('Added 0 transaction');
    }
    return true;
  } catch (err) {
    console.error('Unable to update the database:', err);
    return false;
  }
}
async function fetch_transaction(username) {
  try {
    const transactions = await transaction.find({ username: username }).toArray();
    return transactions;
  } catch (err) {
    console.error('Unable to fetch transactions from the database:', err);
    return null;
  }
}
async function all_transaction(){
  try {
    const transactions = await transaction.find({}).toArray();
    return transactions;
  } catch (err) {
    console.error('Unable to fetch transactions from the database:', err);
    return null;
  }
}
async function update_transaction_eventname(originalName, newEventName){
  try {
    const result = await transaction.updateMany({eventname:originalName},{
      $set:{eventname: newEventName}
    });

    if (result.insertedCount === 1) {
      console.log('Added 1 transaction');
    } else {
      console.log('Added 0 transaction');
    }
    return true;
  } catch (err) {
    console.error('Unable to update the database:', err);
    return false;
  }
};

init_db().catch(console.dir);
export {
  init_db,
  users,
  event,
  tokens,
  transaction,
  validate_user,
  modify_user,
  update_user,
  fetch_user,
  username_exist,
  update_event,
  update_token,
  validate_token,
  forgotPassword,
  gridFSBucket,
  update_transaction,
  fetch_transaction,
  all_transaction,
  update_transaction_eventname,
};
