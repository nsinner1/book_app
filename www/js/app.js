'use strict';

$('#update').on('click', showForm);

function showForm() {
  $('#update-task-form').show();
  $('#update').hide();
  $('#bookInfo').hide();
  $('#delete').hide();
}
