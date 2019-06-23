let projectInCookie = getCookie('plans') || '';

function getCookie(cname) {
	var name = cname + '=';
	var decodedCookie = document.cookie;
	var ca = decodedCookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
}

let plans = [];
let obj = [];
// console.log(plans);

let users = [];
console.log(users);

// ******** MS Planner Auth ************
var applicationConfig = {
	clientID: 'fc4db84f-8e00-47d3-bda3-4059606ae323', //This is your client ID fc4db84f-8e00-47d3-bda3-4059606ae323
	authority: 'https://login.microsoftonline.com/common', //Default authority value is https://login.microsoftonline.com/common
	graphScopes: ['user.read'],
	graphEndpoint: 'https://graph.microsoft.com/v1.0/me/planner/tasks'
};

var myMSALObj = new Msal.UserAgentApplication(
	applicationConfig.clientID,
	applicationConfig.authority,
	acquireTokenRedirectCallBack,
	{
		storeAuthStateInCookie: true,
		cacheLocation: 'localStorage'
	}
);

function signIn() {
	myMSALObj.loginPopup(applicationConfig.graphScopes).then(
		function(idToken) {
			//Login Success
			showWelcomeMessage();
			acquireTokenPopupAndCallMSGraph();
		},
		function(error) {
			console.log(error);
		}
	);
}

function signOut() {
	myMSALObj.logout();
}

function acquireTokenPopupAndCallMSGraph() {
	//Call acquireTokenSilent (iframe) to obtain a token for Microsoft Graph
	myMSALObj.acquireTokenSilent(applicationConfig.graphScopes).then(
		function(accessToken) {
			callMSGraph(
				applicationConfig.graphEndpoint,
				accessToken,
				graphAPICallback
			);
		},
		function(error) {
			console.log(error);
			// Call acquireTokenPopup (popup window) in case of acquireTokenSilent failure due to consent or interaction required ONLY
			if (
				error.indexOf('consent_required') !== -1 ||
				error.indexOf('interaction_required') !== -1 ||
				error.indexOf('login_required') !== -1
			) {
				myMSALObj.acquireTokenPopup(applicationConfig.graphScopes).then(
					function(accessToken) {
						callMSGraph(
							applicationConfig.graphEndpoint,
							accessToken,
							graphAPICallback
						);
					},
					function(error) {
						console.log(error);
					}
				);
			}
		}
	);
}

// *********** call msgraph ***********
function callMSGraph(theUrl, accessToken, callback) {
	//check if cookie is empty
	//if not empty
	//use cookie value to filter plans[]

	$.get('https://yourURL/plans', function(data) {
		const dataLen = data.length;

		for (let i = 0; i < dataLen; i++) {
			let planID = data[i].plan_id;
			let planName = data[i].plan_name;
			let barColor = data[i].bar_color;

			let obj = {
				planID: planID,
				planName: planName,
				barColor: barColor
			};
			plans.push(obj);
			if (dataLen - i === 1) {
				//plans will be overriden here with filtered array (Array.filter())
				let plans2 = plans;
				if (projectInCookie !== '') {
					let uncheckedProject = projectInCookie.split('|');
					console.log(uncheckedProject);

					for (let i = 0; i < uncheckedProject.length; i++) {
						plans2 = plans.filter(function(el) {
							return !el.planName.includes(uncheckedProject[i]);
						});
					}
					console.log(plans);
				}

				token = accessToken;
				getUsers(accessToken);
				// *********** Returns the buckets && their ID ***********
				for (let i = 0; i < plans2.length; i++) {
					$.ajax({
						url:
							'https://graph.microsoft.com/v1.0/planner/plans/' +
							plans2[i].planID +
							'/buckets',
						type: 'GET',
						beforeSend: function(xhr) {
							xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
						},
						data: {},
						success: function(data) {
							//console.log(data)
							plans2[i].buckets = data.value;
							getTasks(data, accessToken, plans2[i].planName);
						},
						error: function(errr) {
							// console.log(errr);
						}
					});
				}
			}
		}
	});
}

function getTasks(buckets, accessToken, planName) {
	//Returns tasks within the respective buckets
	for (let i = 0; i < buckets.value.length; i++) {
		$.ajax({
			url:
				'https://graph.microsoft.com/v1.0/planner/buckets/' +
				buckets.value[i].id +
				'/tasks',
			type: 'GET',
			beforeSend: function(xhr) {
				xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
			},
			data: {},
			success: function(data) {
				// console.log(data.value);
				for (let j = 0; j < data.value.length; j++) {
					// console.log(data.value[j]);
					let assignedUsers = Object.keys(data.value[j].assignments);
					let username = users.find(x => x.id === assignedUsers[0]);

					let firstName = username.displayName.split(' ');
					let etag = encodeURIComponent(
						data.value[j]['@odata.etag']
					).toString();
					let taskID = data.value[j].id;
					let planID = data.value[j].planId;
					// console.log(taskID);
					let plan = plans.find(o => o.planID === planID.trim());
					// console.log(plan);
					if (data.value[j].percentComplete === 100) {
						$('#5').append(
							'<span class="' +
								firstName[0] +
								' ' +
								plan.planName +
								'" data-etag="' +
								etag +
								'"data-taskID="' +
								taskID +
								'" data-planID=" ' +
								planID +
								'" ><li class="drag-item"><p id="title"><strong>Task:</strong>' +
								' ' +
								data.value[j].title +
								'</p><p id="planId"><strong>Project:</strong> ' +
								planName +
								'</p><p class="displayName-b1" id="displayName-b1">' +
								'<hr>' +
								username.displayName +
								'</p>' +
								'<p class="dot" data-toggle="tooltip" data-placement="top" title=""></p>' +
								'<img src="./public/images/' +
								username.displayName +
								'.jpg" alt="user img" class="img-thumbnail"></li>'
						);
					} else if (buckets.value[i].name === 'Planned') {
						$('#1').append(
							'<span class="' +
								firstName[0] +
								' ' +
								plan.planName +
								'" data-etag="' +
								etag +
								'"data-taskID="' +
								taskID +
								'" data-planID=" ' +
								planID +
								'" ><li class="drag-item"><p id="title"><strong>Task:</strong>' +
								' ' +
								data.value[j].title +
								'</p><p id="planId"><strong>Project:</strong> ' +
								planName +
								'</p><p class="displayName-b1" id="displayName-b1">' +
								'<hr>' +
								username.displayName +
								'</p>' +
								'<p class="dot" data-toggle="tooltip" data-placement="top" title="Color represents the associated plan"></p>' +
								'<img src="./public/images/' +
								username.displayName +
								'.jpg" alt="user img" class="img-thumbnail"></li>'
						);
					} else if (buckets.value[i].name === 'QA') {
						$('#6').append(
							'<span class="' +
								firstName[0] +
								' ' +
								plan.planName +
								'" data-etag="' +
								etag +
								'"data-taskID="' +
								taskID +
								'" data-planID=" ' +
								planID +
								'" ><li class="drag-item"><p id="title"><strong>Task:</strong>' +
								' ' +
								data.value[j].title +
								'</p><p id="planId"><strong>Project:</strong> ' +
								planName +
								'</p><p class="displayName-b1" id="displayName-b1">' +
								'<hr>' +
								username.displayName +
								'</p>' +
								'<p class="dot"></p>' +
								'<img src="./public/images/' +
								username.displayName +
								'.jpg" alt="user img" class="img-thumbnail"></li>'
						);
					} else if (buckets.value[i].name === 'In Progress') {
						$('#2').append(
							'<span class="' +
								firstName[0] +
								' ' +
								plan.planName +
								'" data-etag="' +
								etag +
								'"data-taskID="' +
								taskID +
								'" data-planID=" ' +
								planID +
								'" ><li class="drag-item"><p id="title"><strong>Task:</strong>' +
								' ' +
								data.value[j].title +
								'</p><p id="planId"><strong>Project:</strong> ' +
								planName +
								'</p><p class="displayName-b1" id="displayName-b1">' +
								'<hr>' +
								username.displayName +
								'</p>' +
								'<p class="dot"></p>' +
								'<img src="./public/images/' +
								username.displayName +
								'.jpg" alt="user img" class="img-thumbnail"></li>'
						);
					} else if (buckets.value[i].name === 'Backlog') {
						$('#4').append(
							'<span class="' +
								firstName[0] +
								' ' +
								plan.planName +
								'" data-etag="' +
								etag +
								'"data-taskID="' +
								taskID +
								'" data-planID=" ' +
								planID +
								'" ><li class="drag-item"><p id="title"><strong>Task:</strong>' +
								' ' +
								data.value[j].title +
								'</p><p id="planId"><strong>Project:</strong> ' +
								planName +
								'</p><p class="displayName-b1" id="displayName-b1">' +
								'<hr>' +
								username.displayName +
								'</p>' +
								'<p class="dot"></p>' +
								'<img src="./public/images/' +
								username.displayName +
								'.jpg" alt="user img" class="img-thumbnail"></li>'
						);
					} else if (buckets.value[i].name === 'Done') {
						$('#3').append(
							'<span class="' +
								firstName[0] +
								' ' +
								plan.planName +
								'" data-etag="' +
								etag +
								'"data-taskID="' +
								taskID +
								'" data-planID=" ' +
								planID +
								'" ><li class="drag-item"><p id="title"><strong>Task:</strong>' +
								' ' +
								data.value[j].title +
								'</p><p id="planId"><strong>Project:</strong> ' +
								planName +
								'</p><p class="displayName-b1" id="displayName-b1">' +
								'<hr>' +
								username.displayName +
								'</p>' +
								'<p class="dot"></p>' +
								'<img src="./public/images/' +
								username.displayName +
								'.jpg" alt="user img" class="img-thumbnail"></li>'
						);
					}
				}
			},
			error: function(errr) {
				console.log(errr);
			}
		});
	}
}

//  ********** Get users and append to checkbox area ***********
function getUsers(accessToken) {
	$.ajax({
		url:
			'https://graph.microsoft.com/v1.0/groups/c1297fb9-3564-40a5-af2b-c86c88d9c946/members',
		type: 'GET',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
		},
		data: {},
		success: function(data) {
			// console.log(data);
			for (let i = 0; i < data.value.length; i++) {
				let userObj = {
					id: data.value[i].id,
					displayName: data.value[i].displayName,
					url: 'images/' + data.value[i].displayName + '.jpg'
				};
				users.push(userObj);
			}

			for (let i = 0; i < users.length; i++) {
				$('.userCheckboxes').append(
					'<div class="form-check form-check-inline UserCB" id="selectAll"><input class="form-check-input-User" checked="checked" onClick="toggleUser(this)" type="checkbox" name="assignee" id="userCheckbox1" value="1"> <label class="form-check-label" id="usersLabels" for="userCheckbox1">' +
						users[i].displayName +
						'</label> </div>'
				);
			}

			for (let i = 0; i < plans.length; i++) {
				$('.projectCheckboxes').append(
					'<div class="form-check form-check-inline"><input class="form-check-input" checked="checked" onClick="toggleProject(this)" type="checkbox" id="projectCheckbox1" value="option1"> <label class="form-check-label" for="projectCheckbox">' +
						plans[i].planName +
						'</label> </div>'
				);
			}
		},
		error: function(errr) {
			console.log(errr);
		}
	});
}

// ***** update task - NOT IN USE ATM ********

function updateTask(etag, taskID, destinationPlan) {
	let accessToken = token;
	let requestBody = {
		bucketId: destinationPlan
	};

	let requestURL = 'https://graph.microsoft.com/v1.0/planner/tasks/' + taskID;
	$.ajax({
		url: requestURL,
		type: 'PATCH',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('If-Match', etag);
			xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
		},
		data: JSON.stringify(requestBody),
		contentType: 'application/json',
		success: function(data) {
			console.log(data);
		},
		error: function(errr) {
			console.log(errr);
		}
	});
}

function graphAPICallback(data) {
	//Display user data on DOM
	var divWelcome = document.getElementById('WelcomeMessage');
	divWelcome.innerHTML += ' to Microsoft Graph API!!';
	console.log(data, 'ssss');
	document.getElementById('json').innerHTML = JSON.stringify(data, null, 2);
}

function showWelcomeMessage() {
	var divWelcome = document.getElementById('WelcomeMessage');
	divWelcome.innerHTML += myMSALObj.getUser().name;
	var loginbutton = document.getElementById('SignIn');
	loginbutton.innerHTML = 'Sign Out';
	loginbutton.setAttribute('onclick', 'signOut();');
	loginbutton.style.cssText = 'color: red; border: 1px solid red';
}

// This function can be removed if you do not need to support IE
function acquireTokenRedirectAndCallMSGraph() {
	//Call acquireTokenSilent (iframe) to obtain a token for Microsoft Graph
	myMSALObj.acquireTokenSilent(applicationConfig.graphScopes).then(
		function(accessToken) {
			callMSGraph(
				applicationConfig.graphEndpoint,
				accessToken,
				graphAPICallback
			);
			console.log(plans);
		},
		function(error) {
			console.log(error);
			//Call acquireTokenRedirect in case of acquireToken Failure
			if (
				error.indexOf('consent_required') !== -1 ||
				error.indexOf('interaction_required') !== -1 ||
				error.indexOf('login_required') !== -1
			) {
				myMSALObj.acquireTokenRedirect(applicationConfig.graphScopes);
			}
		}
	);
}

function acquireTokenRedirectCallBack(errorDesc, token, error, tokenType) {
	if (tokenType === 'access_token') {
		callMSGraph(applicationConfig.graphEndpoint, token, graphAPICallback);
		console.log(plans);
	} else {
		console.log('token type is:' + tokenType);
	}
}

// Browser check variables
var ua = window.navigator.userAgent;
var msie = ua.indexOf('MSIE ');
var msie11 = ua.indexOf('Trident/');
var msedge = ua.indexOf('Edge/');
var isIE = msie > 0 || msie11 > 0;
var isEdge = msedge > 0;

//If you support IE, our recommendation is that you sign-in using Redirect APIs
//If you as a developer are testing using Edge InPrivate mode, please add "isEdge" to the if check
if (!isIE) {
	if (myMSALObj.getUser()) {
		// avoid duplicate code execution on page load in case of iframe and popup window.
		showWelcomeMessage();
		acquireTokenPopupAndCallMSGraph();
	}
} else {
	document.getElementById('SignIn').onclick = function() {
		myMSALObj.loginRedirect(applicationConfig.graphScopes);
	};

	if (myMSALObj.getUser() && !myMSALObj.isCallback(window.location.hash)) {
		// avoid duplicate code execution on page load in case of iframe and popup window.
		showWelcomeMessage();
		acquireTokenRedirectAndCallMSGraph();
	}
}
//  ************* MS Planner Auth End

// drag elements
dragula([
	document.getElementById('1'),
	document.getElementById('2'),
	document.getElementById('3'),
	document.getElementById('4'),
	document.getElementById('5')
	// document.getElementById('6') ******* Disabled drag and drop for QA ***********
])
	.on('drag', function(el) {
		// add 'is-moving' class to element being dragged
	})
	.on('drop', function(el, target, source) {
		let etag = decodeURIComponent(el.dataset.etag);
		let taskID = el.dataset.taskid;
		let planID = el.dataset.planid;
		let targetBucketName = target.dataset.title;
		console.log(planID);
		let plan = plans.find(o => o.planID === planID.trim());

		console.log(plans);

		let destination = plan.buckets.find(o => o.name === targetBucketName);

		updateTask(etag, taskID, destination.id);
	})
	.on('dragend', function(el) {
		el.classList.add('is-moving');

		// remove 'is-moving' class from element after dragging has stopped
		el.classList.remove('is-moving');
		// add the 'is-moved' class for 600ms then remove it
		window.setTimeout(function() {
			el.classList.add('is-moved');
			window.setTimeout(function() {
				el.classList.remove('is-moved');
			}, 600);
		}, 100);
	});

var createOptions = (function() {
	var dragOptions = document.querySelectorAll('.drag-options');

	// these strings are used for the checkbox labels
	var options = ['Label', 'Assign', 'Copy Task', 'Delete'];

	// create the checkbox and labels here, just to keep the html clean. append the <label> to '.drag-options'
	function create() {
		for (var i = 0; i < dragOptions.length; i++) {
			options.forEach(function(item) {
				var checkbox = document.createElement('input');
				var label = document.createElement('label');
				var span = document.createElement('span');
				checkbox.setAttribute('type', 'checkbox');
				span.innerHTML = item;
				label.appendChild(span);
				label.insertBefore(checkbox, label.firstChild);
				label.classList.add('drag-options-label');
				dragOptions[i].appendChild(label);
			});
		}
	}

	return {
		create: create
	};
})();

var showOptions = (function() {
	// the 3 dot icon
	var more = document.querySelectorAll('.drag-header-more');

	function show() {
		// show 'drag-options' div when the more icon is clicked
		var target = this.getAttribute('data-target');
		var options = document.getElementById(target);
		options.classList.toggle('active');
	}

	function init() {
		for (i = 0; i < more.length; i++) {
			more[i].addEventListener('click', show, false);
		}
	}

	return {
		init: init
	};
})();

createOptions.create();
showOptions.init();
