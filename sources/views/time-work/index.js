import {JetView} from "webix-jet";
import UpdateFormView from "core/updateFormView";
import "components/comboClose";
import "components/comboDateClose";
import "components/searchClose";


export default class ProductsBedView extends JetView{
  config(){
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
                  "label": "Посещения",
                  "width": 150
                },

                {},
                { "label": "", "view": "search-close", "width": 300,  "align" :"right", localId: 'form-search'  },
                {
                  view:"button",
                  value:"fs",
                  width: 30,
                  click: function() {
                    webix.fullscreen.set("time-work-table");
                  }
                },
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
              view: "datatable",
              localId: "time-work-table",
              urlEdit: 'time-work',
              //autoConfig: true,
              css:"webix_header_border webix_data_border",
              //leftSplit:1,
              //rightSplit:2,
              select: true,
              //datafetch:100,
              //datathrottle: 500,
              //loadahead:100,
              resizeColumn: { headerOnly:true },

              columns:[

                { id:"date_work", header:"Дата", width: 100, sort: "string" },
                { id:"employee_name", header:"Сотрудник", width: 180, sort: "string" },
                { id:"time_start", header:"Начало работы", width: 180, sort: "string" },
                { id:"time_end", header:"Конец работы", width: 180, sort: "string", edit: 'text' },

                {
                  "id": "action-delete",
                  "header": "",
                  "width": 50,
                  "template": "{common.trashIcon()}"
                },
                {"id": "action-edit", "header": "", "width": 50, "template": "{common.editIcon()}"}
              ],
              url: this.app.config.apiRest.getUrl('get',"accounting/employee-time-works", {'sort':'name'}),//"api->accounting/contragents",
              save: "api->accounting/employee-time-works",
              // scheme: {
              //    $sort:{ by:"name", dir:"asc" },
              //  },

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

                  } else {
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

    let form = this.$$("form-search");
    let table = this.$$("time-work-table");
    //table.markSorting("name", "asc");
    let scope = this;
    // table.attachEvent("onDataRequest", function (start, count) {
    //   webix.ajax().get(scope.app.config.apiRest.getUrl('get', 'accounting/contragents', {
    //     "expand": "contragent,category,project,account,data",
    //     "per-page": count, "start" : start
    //   })).then(function (data) {
    //     //table.parse(data);
    //     // table.parse({
    //     //   pos: your_pos_value,
    //     //   total_count: your_total_count,
    //     //   data: data
    //     // });
    //   });
    //
    //   return false;
    // });


    form.attachEvent("onChange", function(obj){

      let filter = {'search':form.getValue()};
      let objFilter = { filter: filter };

      webix.extend(table, webix.ProgressBar);

      table.clearAll(true);
      table.showProgress({
        delay:2000,
        hide:false
      });

      webix.ajax().get( scope.app.config.apiRest.getUrl('get','accounting/employee-time-works'), objFilter).then(function(data) {
        table.parse(data);
      });


      // table.loadNext(0, 0, 0, 0, 1).then(function (data) {
      //     table.clearAll(true);
      //     table.parse(data);
      // });

    });

    this.cashEdit = this.ui(UpdateFormView);
  }

  doAddClick() {
    this.$$('time-work-table').unselect();
    this.cashEdit.showForm(this.$$('time-work-table'));
  }

}