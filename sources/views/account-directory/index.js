import {JetView} from "webix-jet";
import UpdateFormView from "core/updateFormView";
import {productTypes} from "models/product/product-type";
import "components/comboClose";
import "components/comboDateClose";
import "components/searchClose";


export default class AccountDirectoryView extends JetView{
  config(){
    let scope = this;
    return {
      localId: "layout",
      type:"wide",
      cols:[
        {
          rows: [


            {
              "view": "toolbar",
              height: 40,
              paddingY:2,
              cols: [
                {
                  "view": "label",
                  "label": "Счета",
                  "width": 150
                },

                {},
                {
                  view:"icon",
                  //type:"icon",
                  icon: 'mdi mdi-refresh',
                  autowidth:true,
                  value :true,
                  click: function() { scope.doRefresh() }

                },
                {
                  view:"toggle",
                  type:"icon",
                  icon: 'mdi mdi-file-tree',
                  autowidth:true,
                  value :true,
                  click: function() { scope.doClickOpenAll() }

                },
                { "label": "", "view": "search-close", "width": 300,  "align" :"right", localId: 'form-search'  }
              ]
            },
            {
              "view": "toolbar",
              "height": 40,
              "paddingY":2,
              "cols": [
                {
                  "label": "Добавить",
                  "type":"icon",
                  "icon":"mdi mdi-plus",
                  "view": "button",
                  "height": 50,
                  "css": "webix_primary",
                  //"width": 120,
                  autowidth:true,
                  click: () => this.doAddClick()
                },


              ]
            },

            {
              view: "treetable",
              localId: "account-table",
              urlEdit: 'account',
              css:"webix_header_border webix_data_border",
              leftSplit:2,
              select: true,
              resizeColumn: { headerOnly:true },

              columns:[

                { id:"name", header:"Наиименование", width: 280, sort: "string"
                },
                { id:"id", header:"#",	width:50, sort: "int", template: function(obj, common) {
                  if (!obj.$group) return obj.id;
                  return '';
                }
                },
                { id:"account", header:"1с ID", width: 180, sort: "string", edit: 'text' },
                { id:"currency_id", header:"Валюта", width: 180, sort: "string", edit: 'text' },
                { id:"initial_balance", header:"Начальный остаток", width: 180, sort: "string", edit: 'text' },

                {
                  "id": "action-delete",
                  "header": "",
                  "width": 50,
                  "template": "{common.trashIcon()}"
                },
                {"id": "action-edit", "header": "", "width": 50, "template": "{common.editIcon()}"}
              ],
              url: this.app.config.apiRest.getUrl('get',"accounting/accounts", {'sort':'name', 'per-page': -1}),
              save: "api->accounting/accounts",
              // scheme: {
              //    $sort:{ by:"name", dir:"asc" },
              //  },
              scheme:{
                // $group:{
                //   by:function(obj){ return obj.type_id}, // 'company' is the name of a data property
                //   map:{
                //     value:["type_id"],
                //   },
                // }
              },
              on:{
                onItemClick:function(id, e, trg) {

                  if (id.column == 'action-delete') {
                    var table = this;
                    webix.confirm("Удалить запись?").then(function(result){
                      webix.dp(table).save(
                        id.row,
                        "delete"
                      ).then(function(obj){
                        webix.dp(table).ignore(function(){
                          table.remove(id.row);
                        });
                      }, function(){
                        webix.message("Ошибка! Запись не удалена!");
                      });
                    });

                  }
                  if (id.column == 'action-edit') {
                    this.$scope.cashEdit.showForm(this);
                  }
                },
                onBeforeLoad:function(){
                  this.showOverlay("Loading...");
                },
                onAfterLoad:function(){
                  if (!this.count())
                    this.showOverlay("Sorry, there is no data");
                  else
                    this.hideOverlay();
                },
              }
            }
          ]
        },

      ]
    };
  }

  init(view){
    let table = this.$$("account-table");
    let form = this.$$("form-search");
    let scope = this;
    webix.extend(table, webix.ProgressBar);

    form.attachEvent("onChange", function(obj){
      scope.getData();
    });

    this.cashEdit = this.ui(UpdateFormView);
  }

  getData() {

    let table = this.$$("account-table");
    let form = this.$$("form-search");
    let scope = this;
    let filter = {'search':form.getValue()};
    let objFilter = { filter: filter };

    webix.extend(table, webix.ProgressBar);

    table.clearAll(true);
    table.showProgress({
      delay:2000,
      hide:false
    });

    webix.ajax().get( scope.app.config.apiRest.getUrl('get','accounting/accounts', {'sort':'name', 'per-page': -1}), objFilter).then(function(data) {
      table.parse(data);
      table.enable();
      table.openAll();
    });
  }

  doAddClick() {
    this.$$('account-table').unselect();
    this.cashEdit.showForm(this.$$('account-table'));
  }

  doClickOpenAll() {
    let table = this.$$("account-table");
    if (table.getOpenItems().length >0 ) {
      table.closeAll();
    } else {
      table.openAll();
    }
  }

  doRefresh() {
    let table = this.$$("account-table");
    table.disable();
    table.showProgress({
      type:"icon",
      hide:false
    });
    this.getData()();

  }

}