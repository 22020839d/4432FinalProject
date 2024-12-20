//<!--22021332d Chan Hei-->
//<!--22020839d Wong Sing Ho Samuel-->
$(document).ready(function () {
  let activityTimer;

  const resetActivityTimer = () => {
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
      console.log('User is idle. Log them out.');
      var formdata = new FormData();
      formdata.append('timeout', true);
      fetch('/auth/logout',{method: 'POST', body:formdata}).then(data=>{
        window.location.href = '/index.html'; // Redirect to logout page
        $("#login_register").removeClass('d-none').addClass('show');
        $("#logout_info").removeClass('show').addClass('d-none');
      })
    }, 600000); // 10mins
  };

  document.addEventListener('mousemove', resetActivityTimer);
  document.addEventListener('mousedown', resetActivityTimer);
  document.addEventListener('keypress', resetActivityTimer);
});