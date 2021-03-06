/* 
Code here is a stub, 
DO NOT USE IT IN PRODUCTION

When you have the actual server side delete the stub code below
and create custom functions, like the next

function status(){
	return webix.ajax().post("server/login.php?status")
		.then(a => a.json());
}

function login(user, pass){
	return webix.ajax().post("server/login.php", {
		user, pass
	}).then(a => a.json());
}

function logout(){
	return webix.ajax().post("server/login.php?logout")
		.then(a => a.json());
}

*/
import {getRestUrl} from "models/rest";
import {ApiRest} from "./restModel";

function status(){
	return new webix.promise((resolve) => {
		resolve(webix.storage.local.get("wjet_user"))
	});
}


function login(user, pass){
	this.logout();
	let rest = new ApiRest();
  let url = rest.getUrl('get','users/login');
	return new webix.promise((resolve, reject) => {

			webix.ajax().post(url, {'username': user, 'password': pass}, function(text, data, xhr){
				var result = data.json();
				if (result.success) {
          				//rest.authKey = result.token;
									webix.storage.local.put("wjet_user", { user:result.user.email, token: result.token,
										user_id: result.user.id, type: result.user.type, firebase_uid: result.user.firebase_uid});

          				webix.storage.local.put("wjet_permission", result.user['permissions_finplan']);
									resolve({ user: result.user.email, token: result.token, type: result.user.type, start_page: result.user.start_page, firebase_uid: result.user.firebase_uid});
				} else {
									resolve(null);
				}

			});

	});
}

function logout(){
	return new webix.promise((resolve, reject) => {
		webix.storage.local.remove("wjet_user");
		resolve(null)
	});
}

export default {
	status, login, logout
}