import {JetView} from "webix-jet";
import UpdateFormView from "core/updateFormView";
import "components/comboClose";
import "components/comboDateClose";
import "components/searchClose";

webix.UIManager.addHotKey("enter", function(view){
  var pos = view.getSelectedId();
  view.edit(pos);
}, $$("cloth-table"));

export default class ClothDirectoryView extends JetView{
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
                  "label": "Ткани",
                  "width": 150
                },

                {},
                { "label": "", "view": "search-close", "width": 300,  "align" :"right", localId: 'form-search'  },
                {
                  view:"button",
                  value:"fs",
                  width: 30,
                  click: function() {
                    webix.fullscreen.set("cloth-table");
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
              localId: "cloth-table",
              urlEdit: 'cloth',
              //autoConfig: true,
              css:"webix_header_border webix_data_border",
              //leftSplit:1,
              //rightSplit:2,
              select: 'cell',
              //datafetch:100,
              //datathrottle: 500,
              //loadahead:100,
              resizeColumn: { headerOnly:true },
              editable:true,
              editaction: "dblclick",
              clipboard:"selection",
              multiselect:true,
              math: true,
              sort:"multi",

              columns:[
                { id:"index", header:"#", sort:"int", width:50},
                { id:"id", header:"ID",	width:50, sort: "int" },
                { id:"provider",  header:[ "Поставщик", { content:"selectFilter" }], width: 120, edit: 'text', sort: "text" },
                { id:"full_name", header:[ "Полн. наимен.", { content:"textFilter" }], width: 380, sort: "text" },
                { id:"name",  header:[ "Название", { content:"textFilter" }], width: 120,  edit: 'text', sort: "text" },
                { id:"color",  header:[ "Цвет", { content:"textFilter" }], width: 120,  edit: 'text', sort: "text" },
                { id:"price",  header:[ "Цена", { content:"numberFilter" }], width: 120, edit: 'text', sort: "int" },
                { id:"category",  header:[ "Категория", { content:"selectFilter" }], width: 120,  edit: 'text', sort: "int" },
                { id:"qty",  header:[ "К-во", { content:"numberFilter", format: webix.i18n.numberFormat }], width: 120,  edit: 'text', editor:"text", sort: "int"},
                { id:"sum", header:[ "Сумма", { content:"summColumn" ,  css: {"text-align": "right",  "font-weight": 300}}], format: webix.i18n.numberFormat,
                  css: {"text-align": "right",  "font-weight": 300}, sort: "int",
                  width: 120,  edit: 'text',   math:"[$r,price] * [$r,qty]"},


                {
                  "id": "action-delete",
                  "header": "",
                  "width": 50,
                  "template": "{common.trashIcon()}"
                },
                {"id": "action-edit", "header": "", "width": 50, "template": "{common.editIcon()}"}
              ],
              url: this.app.config.apiRest.getUrl('get',"accounting/cloths", {'sort':'provider+name+color', 'per-page': '-1'}),//"api->accounting/contragents",
              save: "api->accounting/cloths",
              // scheme: {
              //    $sort:{ by:"name", dir:"asc" },
              //  },


              ready:function(){
                // apply sorting
                this.sort([{by:"provider", dir:"asc"}, {by:"name", dir:"asc"}, {by:"color", dir:"asc"}]);
                // mark columns
                this.markSorting("provider", "asc");
                this.markSorting("name", "asc", true);
                this.markSorting("color", "asc", true);
              },
              on:{
                "data->onStoreUpdated":function(){
                  this.data.each(function(obj, i){
                    obj.index = i+1;
                  })
                },
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

    let form = this.$$("form-search");
    let table = this.$$("cloth-table");
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
      let objFilter = { filter: filter, 'sort':'color' };

      webix.extend(table, webix.ProgressBar);

      table.clearAll(true);
      table.showProgress({
        delay:2000,
        hide:false
      });

      webix.ajax().get( scope.app.config.apiRest.getUrl('get','accounting/cloths', {'sort':'provider+name+color', 'per-page': '-1'}), objFilter).then(function(data) {
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
    this.$$('cloth-table').unselect();
    this.cashEdit.showForm(this.$$('cloth-table'));
  }

}