// *************** get user input value ***************
let plandID = document.getElementById('planIdInput').value;

document.getElementById('planIdInput').oninput = function() {
	planID = this.value;
	// console.log(planID);
};

let planName = document.getElementById('planNameInput').value;

document.getElementById('planNameInput').oninput = function() {
	planName = this.value;
	// console.log(planName);
};

// let backRGB = document.getElementById('color').value;

// document.getElementById('color').onchange = function() {
// 	backRGB = this.value;
// 	console.log(backRGB);
// };

// ********* tooltip toggle *************
$(function() {
	$('[data-toggle="tooltip"]').tooltip();
});

// ************ Delete User ************
function deletePlan(event) {
	event.preventDefault();
	// Pop up a confirmation dialog
	let confirmation = confirm('Are you sure you want to delete this plan?');

	// Check and make sure the user confirmed
	if (confirmation === true) {
		// If they did, do our delete
		$.ajax({
			type: 'DELETE',
			url: 'https://YourURL/plans/' + planName
		}).done(function(response) {
			// Check for a successful (blank) response
			if (response.msg === '') {
			} else {
				alert('Deleted');
				location.reload();
			}
		});
	} else {
		// If they said no to the confirm, do nothing
		return false;
	}
}

// ********* Delete User btn click *********
$('#deletePlanBtn').on('click', deletePlan);

async function del(req, res, next) {
	try {
		const id = parseInt(req.params.id, 10);
		const success = await plans.delete(id);
		if (success) {
			// location.reload();
			res.status(200).end();
		} else {
			// location.reload();
			res.status(404).end();
		}
	} catch (err) {
		next(err);
	}
}

// **** Get plans from DB and append to modal********
$(document).ready(function(modalCB) {
	$.get('https://yourURL/plans', function(data) {
		// console.log(data);
		for (let i = 0; i < data.length; i++) {
			let plan_name = data[i].plan_name;
			// console.log($('.plansCb'));
			// console.log(data[i].checkbox_state);
			if (data[i].checkbox_state === true) {
				$('.plansCb').append(
					'<div class="form-check form-check-inline"><input class="form-check-input" checked="checked" onClick="toggleUser(this)" type="checkbox" id="planCheckbox1" value="option1"> <label class="form-check-label" for="planCheckbox1">' +
						data[i].plan_name +
						'</label> </div>'
				);
			} else {
				$('.plansCb').append(
					'<div class="form-check form-check-inline"><input class="form-check-input" onClick="toggleUser(this)" type="checkbox" id="planCheckbox1" value="option1"> <label class="form-check-label" for="planCheckbox1">' +
						data[i].plan_name +
						'</label> </div>'
				);
			}
		}
	});
});

// ****** hide QA on page ready *******
$(document).ready(function() {
	$('#CB6 input[type=checkbox]').attr('checked', false);
	if ($('#CB6').is(':checked')) {
		$('.drag-column-QA').css('display', 'block');
	} else {
		$('.drag-column-QA').css('display', 'none');
	}
});

// ***********show/hide buckets**********

$('#bucketCheckbox1').on('click', function() {
	$('.drag-column-backlog').fadeToggle(1000);
});

$('#bucketCheckbox2').on('click', function() {
	$('.drag-column-planned').fadeToggle(1000);
});

$('#bucketCheckbox3').on('click', function() {
	$('.drag-column-in-progress').fadeToggle(1000);
});

$('#bucketCheckbox4').on('click', function() {
	$('.drag-column-done').fadeToggle(1000);
});
//completed hidden on page load
$('#bucketCheckbox5').on('click', function() {
	if ($('#bucketCheckbox5').is(':checked')) {
		$('.drag-column-completed').css('display', 'block');
	} else {
		$('.drag-column-completed').css('display', 'none');
	}
});

//*********show/hide projects*************
function toggleProject(el) {
	console.log(el);
	let planName = el.parentElement.innerText;
	console.log(planName);
	let ArrayTest1 = document.getElementsByClassName(planName);

	ArrayTest1 = Array.prototype.slice.call(ArrayTest1);

	// console.log(ArrayTest1);

	if ($(el).is(':checked')) {
		ArrayTest1.forEach(function(element) {
			element.style.display = 'block';
		});
	} else {
		ArrayTest1.forEach(function(element) {
			element.style.display = 'none';
		});
	}
}

//*********** Show/hide buckets ************
function toggleBuckets(el) {
	// console.log(el);
	let bucketName = el.parentElement.innerText;
	console.log(bucketName);
	let ArrayTest2 = document.getElementsByClassName(bucketName);

	ArrayTest2 = Array.prototype.slice.call(ArrayTest2);

	console.log(ArrayTest2);

	if ($(el).is(':checked')) {
		ArrayTest2.forEach(function(element) {
			element.style.display = 'block';
		});
	} else {
		ArrayTest2.forEach(function(element) {
			element.style.display = 'none';
		});
	}
}

//  *************** show/hide users *************
function toggleUser(el) {
	let userName = el.parentElement.innerText.split(' ')[0];
	let ArrayTest3 = document.getElementsByClassName(userName);
	console.log(userName);

	ArrayTest3 = Array.prototype.slice.call(ArrayTest3);
	console.log(ArrayTest3);
	if ($(el).is(':checked')) {
		ArrayTest3.forEach(function(element) {
			element.style.display = 'block';
		});
	} else {
		ArrayTest3.forEach(function(element) {
			element.style.display = 'none';
		});
	}

	let bulk = ArrayTest3;
	for (let r = 0; r < bulk.length; r++) {
		$('#userCheckboxAll').click(function(element) {
			if (this.checked) {
				// Iterate each checkbox
				$('#userCheckboxes input[name="assignee"]').each(function() {
					this.checked = true;
				});
				$(bulk).show();
			} else {
				$('#userCheckboxes input[name="assignee"]').each(function() {
					this.checked = false;
				});
				$(bulk).hide();
			}
		});
	}
}

$(document).ready(function() {
	$('#userCheckboxAll').prop('checked', true);
});

$().button('toggle');
