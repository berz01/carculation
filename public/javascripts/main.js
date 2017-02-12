$('#logout').click(function() {
  sessionStorage.clear();
});

$(".links a").click(function() {
  $(".panels").hide();
  $(this.hash).fadeIn();
});
