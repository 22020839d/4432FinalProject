//<!--22021332d Chan Hei-->
//<!--22020839d Wong Sing Ho Samuel-->

// Call the function when the page is ready
var user;
var isUpdateInProgress = false;
$(document).ready(function () {
    getUserDataAndImage();
    getUserTransactionHistory();
});
// Function to get user data from the server
async function getUserDataAndImage() {
    // Make a fetch request to your /me route to get the user data
    await fetch('/auth/me')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Display user information
                user = data.user;
                displayUserInfo(user);
                // Check if the user has a profileImage field
                if (data.user.profileImage) {
                    // Display the profile image
                    displayProfileImage(data.user.profileImage);
                }
            } else {
                console.error('Error fetching user data:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
}
// Function to display user information
function displayUserInfo(user) {
     const loginAttemptDate = new Date(user.loginattempt);

    // Format the date for display
    const formattedDate = loginAttemptDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    });

    const changeAttemptDate = new Date(user.change);

    // Format the date for display
    const formattedDatechange = changeAttemptDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    });
    // Construct the HTML content with user information
    var userInfoHTML =
        '<div class="m-3 h5">' +
          '<div class="row mb-3">' +
              '<div class="col"><p>Username:</p></div>' +
              '<div class="col">' + user.username + '</div>' +
          '</div>' +
          '<div class="row mb-3">' +
              '<div class="col"><p>Birthday:</p></div>' +
              '<div class="col">' + user.birthday + '</div>' +
          '</div>' +
          '<div class="row mb-3">' +
              '<div class="col"><p>Gender:</p></div>' +
              '<div class="col">' + user.gender + '</div>' +
          '</div>' +
          '<div class="row mb-3">' +
              '<div class="col"><p>Nickname:</p></div>' +
              '<div class="col">' + user.nickname + '</div>' +
          '</div>' +
          '<div class="row mb-3">' +
              '<div class="col"><p>Email:</p></div>' +
              '<div class="col">' + user.email + '</div>' +
          '</div>' +
          '<div class="row mb-3">' +
              '<div class="col"><p>Password:</p></div>' +
              '<div class="col">********</div>' +
          '</div>' +
          '<div class="row mb-3">' +
              '<div class="col"><p>Last login attempt</p></div>' +
              '<div class="col">'+formattedDate+'</div>' +
          '</div>' +
          '<div class="row mb-3">' +
              '<div class="col"><p>Last edit profile or password</p></div>' +
              '<div class="col">'+formattedDatechange+'</div>' +
          '</div>' +
          
          '<div class="row mb-3">' +
              '<div class="col"><button id="modifyUserInfoBtn" class="btn btn-primary" onClick="replaceWithEditForm()">Edit</button></div>' +
          '</div>' +
        '</div>';

    $('#Account_info').html(userInfoHTML);
}
// Function to display the user's profile image
function displayProfileImage(base64Image) {
    const imageElement = document.getElementById('userImage'); // Assuming you have an <img> element with id="profileImage"
  
    // Set the src attribute of the img element to the base64-encoded image
    imageElement.src = 'data:image/jpeg;base64,' + base64Image;
}
// Function to replace user information with a form for modification
function replaceWithEditForm() {
   if (isUpdateInProgress) {
        alert('Please wait before making another update.');
        return;
    }
    var editFormHTML = 
       '<div class="m-3">' +
          '<form id="editUserInfoForm">' +
            '<div class="row mb-3">' +
                '<div class="col"><label for="username" class="form-label">Username:</label></div>' +
                '<div class="col"><input type="text" class="form-control" name="username" value="' + user.username + '"></div>' +
            '</div>' +
            '<div class="row mb-3">' +
                '<div class="col"><label for="birthday" class="form-label">Birthday:</label></div>' +
                '<div class="col"><input type="text" class="form-control" name="birthday" value="' + user.birthday + '"></div>' +
            '</div>' +
            '<div class="row mb-3">' +
                '<div class="col"><label for="gender" class="form-label">Gender:</label></div>' +
                '<div class="col"><input type="text" class="form-control" name="gender" value="' + user.gender + '"></div>' +
            '</div>' +
            '<div class="row mb-3">' +
                '<div class="col"><label for="nickname" class="form-label">Nickname:</label></div>' +
                '<div class="col"><input type="text" class="form-control" name="nickname" value="' + user.nickname + '"></div>' +
            '</div>' +
            '<div class="row mb-3">' +
                '<div class="col"><label for="email" class="form-label">Email:</label></div>' +
                '<div class="col"><input type="text" class="form-control" name="email" value="' + user.email + '"></div>' +
            '</div>' +
            '<div class="row mb-3">' +
                '<div class="col"><label for="password" class="form-label">Password:</label></div>' +
                '<div class="col"><input type="password" class="form-control" name="password" value="' + user.password + '"></div>' +
            '</div>' +
            '<div class="row mb-3">'+
                '<div class="col"><label for="User_Image">Profile picture</label></div>'+
                '<div class="col"><input type="file" class="form-control" name="profileImage" id="User_Image" accept="image/*"></div>'+
            '</div>'+
            '<div class="row">' +
                '<div class="col"><button type="button" id="saveChangesBtn" class="btn btn-primary" onClick="saveChanges()">Save Changes</button></div>' +
            '</div>' +
          '</form>' +
        '</div>';

    // Replace the user information with the form
    $('#Account_info').html(editFormHTML);

    // Add a click event to the "Save Changes" button
    $('#saveChangesBtn').click(saveChanges);
}
// Function to save changes and revert to displaying user information
async function saveChanges() {
   if (isUpdateInProgress) {
        alert('Please wait before making another update.');
        return;
    }
    var updatedUserData = {
        username: $('input[name="username"]').val(),
        birthday: $('input[name="birthday"]').val(),
        gender: $('input[name="gender"]').val(),
        nickname: $('input[name="nickname"]').val(),
        password: $('input[name="password"]').val(),
        email: $('input[name="email"]').val(),
        loginattempt:this.user.loginattempt,
        change:this.user.change,
        profileImage: document.querySelector('input[name="profileImage"]').files[0]
    };
    var formdata = new FormData();
    await fetch('/auth/me',{method:"GET"})
        .then(response=>response.json())
        .then(data => {
            formdata.append('uid', data.user.uid);
        }).catch(error =>{
          alert("Error: ",error);
      })
      formdata.append('username', $('input[name="username"]').val());
      formdata.append('birthday', $('input[name="birthday"]').val());
      formdata.append('gender', $('input[name="gender"]').val());
      formdata.append('nickname', $('input[name="nickname"]').val());
      formdata.append('password', $('input[name="password"]').val());
      formdata.append('email', $('input[name="email"]').val());
      formdata.append('profileImage', document.querySelector('input[name="profileImage"]').files[0]);
      await fetch('/auth/updateinfo',{
        method:'POST',
        body:formdata
      }).then(response=>response.json())
      .then(data=>{
        if(data.status == 'success'){
          $('#Account_info').data('user', updatedUserData);
          displayUserInfo(updatedUserData);
          isUpdateInProgress = true;
          setTimeout(() => {
              isUpdateInProgress = false;
          }, 30000);
        }
        else{
          alert(data.message);
        }
      }).catch(error =>{
          alert("Error: ",error);
      })
}
// Function to get and display user transaction history
async function getUserTransactionHistory() {
    // Make a fetch request to your '/transactionHistory' route
    await fetch('/auth/transactionHistory')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Display the transaction history
                displayTransactionHistory(data.transactions);
            } else {
                console.error('Error fetching transaction history:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching transaction history:', error);
        });
}
// Function to display user transaction history
function displayTransactionHistory(transactions) {
    // Check if there are transactions to display
    if (transactions && transactions.length > 0) {
        // Construct HTML content with transaction history
        var transactionHistoryHTML =
            '<div class="m-3">' +
                '<h5 class="mb-3">Transaction History</h5>';

        transactions.forEach(transaction => {
            var rescheduleInfo = transaction.reschedule ? '<span class="text-danger">Rescheduled</span> ' : '';

            var cancelInfo = transaction.cancel ? '<span class="text-danger">Canceled</span> ' : '';
            const EventDate = new Date(transaction.eventdate);

            // Format the date for display
            const formattedDate = EventDate.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short',
            });

            const PurchaseDate = new Date(transaction.date);

            // Format the date for display
            const formattedPurchaseDate = PurchaseDate.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short',
            });
            transactionHistoryHTML +=
                '<div class="card mb-3" style="background-color: rgb(243, 132, 169);color: rgb(250,240,190);">' +
                    '<div class="card-body">' +
                        '<p><strong>Movie Name:</strong> ' + transaction.eventname + '</p>' +
                        '<p><strong>Movie Date:</strong> ' + formattedDate + '</p>' +
                        '<p><strong>Purchase Date:</strong> ' + rescheduleInfo + cancelInfo + formattedPurchaseDate + '</p>' +
                        '<p><strong>Price:</strong> ' + transaction.price + '</p>' +
                        '<p><strong>Seats:</strong> ' + transaction.seat + '</p>' +
                    '</div>' +
                '</div>';
        });

        transactionHistoryHTML += '</div>';

        // Replace the content of the 'History' tab with the transaction history
        $('#History').html(transactionHistoryHTML);
    } else {
        // If no transactions are found, display a message
        var noTransactionsHTML =
            '<div class="m-3">' +
                '<p>No transactions found for the user.</p>' +
            '</div>';

        // Replace the content of the 'History' tab with the message
        $('#History').html(noTransactionsHTML);
    }
}


