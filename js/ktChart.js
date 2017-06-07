/**
 * Created by mbaluev on 15.11.2016.
 */

;(function(){
    // [CHANGE] Создаю неймспейсы
    // begin
    window.Asyst = window.Asyst || {};
    Asyst.Workspace = Asyst.Workspace || {};
    var root = Asyst.Workspace.Points = {};
    //end

    var $ = jQuery;
    var ktDom = root.ktDom = (function(){
        function ktDom(id, filter){
            var self = this;
            this.id = id;
            this.selector = "#" + this.id;
            this.filter_obj = {
                filter: filter,
                filter_apply: [],
                filter_timeout: null,
                filter_old_input_value: "",
                filter_input_delay: 500,
                objects: {
                    select_y: null,
                    select_color: null,
                    btn_apply_filter: null,
                    btn_clear_filter: null,
                    btn_legend: null,
                    btn_info: null,
                    btn_full_screen: null,
                    input_filters: []
                }
            };
            this.loaders = [];
            this.options = null;
            this.data = null;
            self.init();
            self.create();
            // create elements
            self.filter_create();
            self.legend_create();
            self.graph_create();
            self.info_create();
        };

        ktDom.prototype.time_start = function(){
            var self = this;
            self.timer2 = Date.now();
        };
        ktDom.prototype.time_console = function(text){
            var self = this;
            console.log(Date.now() - self.timer2 + ' ms ' + text);
            self.timer2 = Date.now();
        };

        ktDom.prototype.init = function(){
            var self = this;
            self.timer = null;
            self.options = {
                _width_legend: 200,
                _width_info: 400
            };
            self.options.width_legend = self.options._width_legend;
            self.options.width_info = self.options._width_info;
            self.class = {
                panel_filter: "panel-filter",
                panel_filter_functions: "pf-functions",
                panel_filter_buttons: "pf-buttons",
                panel_filter_filters: "pf-filters",
                panel_loader: "panel-loader",
                panel_main: "panel-main",
                panel_graph: "panel-graph",
                panel_legend: "panel-legend",
                panel_info: "panel-info",
                panel_info_header: "pi-header",
                panel_info_body: "pi-body",
            };
            self.dom = {
                spinner_overlay: $('<div class="spinner-overlay"></div>'),
                spinner_container: $('<div class="spinner-container"></div>'),
                spinner: $('<div class="spinner center"></div>'),
                spinner_text: $('<div class="spinner-text"></div>'),
                panel_loader: $('<div class="' + self.class.panel_loader + '"></div>'),
                panel_main: $('<div class="' + self.class.panel_main + '"></div>'),
                panel_filter: $('<div class="' + self.class.panel_filter + '">' +
                                    '<div class="pf-row"><ul class="nav pf-container ' + self.class.panel_filter_functions + '"></ul><ul class="nav pf-container pf-nowrap ' + self.class.panel_filter_buttons + '"></ul></div>' +
                                    '<div class="pf-row"><ul class="nav pf-container ' + self.class.panel_filter_filters + '"></ul></div>' +
                                '</div>'),
                panel_legend: $('<div class="' + self.class.panel_legend + '"></div>'),
                panel_graph: $('<div class="' + self.class.panel_graph + '"></div>'),
                panel_info: $('<div class="' + self.class.panel_info + '"></div>'),
                panel_info_header: $('<div class="' + self.class.panel_info_header + '"></div>'),
                panel_info_body: $('<div class="' + self.class.panel_info_body + '"></div>'),
                panel_info_header_nav_tabs: $('<ul class="nav nav-tabs" role="tablist"></ul>'),
                panel_info_header_tabs: {
                    filtered: $('<li role="presentation" class="active"><a href="#filtered" aria-controls="filtered" role="tab" data-toggle="tab">Точки (0)</a></li>'),
                    selected: $('<li role="presentation"><a href="#selected" aria-controls="selected" role="tab" data-toggle="tab">Выбранные (0)</a></li>'),
                    connected: $('<li role="presentation"><a href="#connected" aria-controls="connected" role="tab" data-toggle="tab"><span class="ellipsis">Точка</span></a></li>')
                },
                panel_info_body_tab_content: $('<div class="tab-content"></div>'),
                panel_info_body_tabs: {
                    filtered: $('<div role="tabpanel" class="tab-pane active" id="filtered"></div>'),
                    selected: $('<div role="tabpanel" class="tab-pane" id="selected"></div>'),
                    connected: $('<div role="tabpanel" class="tab-pane" id="connected"></div>'),
                },
                select_report_calendar: null,
            };
        };
        ktDom.prototype.create = function(){
            var self = this;
            $(self.selector).append(self.dom.panel_main);
            self.dom.panel_filter.css('right', self.options.width_info);
            self.dom.panel_legend.css('right', self.options.width_info).css('width', self.options.width_legend);
            self.dom.panel_graph.css('right', (self.options.width_info + self.options.width_legend));
            self.dom.panel_info.css('width', self.options.width_info);
            self.dom.panel_main.append(
                self.dom.panel_filter,
                self.dom.panel_legend,
                self.dom.panel_graph,
                self.dom.panel_info
            );
        };

        ktDom.prototype.graph_create = function(){
            var self = this;
            self.dom.panel_graph.css('top', self.dom.panel_filter.height());
        };

        ktDom.prototype.filter_create = function(){
            var self = this;

            /*y-dimentions*/
            var $yli = $('<li></li>');
            var $yselect = $('<select id="y-dimention"></select>');
            $yselect.append($("<option />", { value: 'byLevel', text: 'Ось Y: по уровню КТ' }));
            $yselect.append($("<option />", { value: 'byPortfolio', text: 'Ось Y: по портфелю' }));
            $yselect.append($("<option />", { value: 'byProject', text: 'Ось Y: по проекту' }));
            $yselect.append($("<option />", { value: 'byStatus', text: 'Ось Y: по статусу КТ' }));
            $yselect.append($("<option />", { value: 'byLeader', text: 'Ось Y: по ответственному' }));
            self.dom.panel_filter.find('.' + self.class.panel_filter_functions).append($yli.append($yselect));
            $yselect.chosen({width: '180px', language:'ru', allow_single_deselect:true, disable_search_threshold: 10, no_results_text:'Ничего не найдено!'});
            $yselect.parent().find('a.chosen-single').css('border-color','#999');
            self.filter_obj.objects.select_y = $yselect;

            /*filter color functions*/
            var $li = $('<li></li>');
            var $cselect = $('<select id="colortype"></select>');
            $cselect.append($("<option />", { value: 'colorByLevelId', text: 'Цвет: по уровню КТ', datafield: 'level' }));
            $cselect.append($("<option />", { value: 'colorByPortfolioId', text: 'Цвет: по портфелю', datafield: 'portfolioid' }));
            $cselect.append($("<option />", { value: 'colorByProjectId', text: 'Цвет: по проекту', datafield: 'projectid' }));
            $cselect.append($("<option />", { value: 'colorByStatusId', text: 'Цвет: по статусу КТ', datafield: 'statusid' }));
            $cselect.append($("<option />", { value: 'colorByLeaderId', text: 'Цвет: по ответственному', datafield: 'leaderid' }));
            //$cselect.append($("<option />", { value: 'colorByReportCalendarId', text: 'Цвет: по статус отчету ...', datafield: 'reportstatusterm' }));
            self.dom.panel_filter.find('.' + self.class.panel_filter_functions).append($li.append($cselect));
            $cselect.chosen({width: '180px', language:'ru', allow_single_deselect:true, disable_search_threshold: 10, no_results_text:'Ничего не найдено!'});
            $cselect.parent().find('a.chosen-single').css('border-color','#999');
            self.filter_obj.objects.select_color = $cselect;

            /*generate select reportCalendars*/
            /*
            function select_reportCalendar($liparent, callback){
                if (data.dictionaries) {
                    if (data.dictionaries.repType) {
                        var $li = $('<li></li>');
                        var $select = $('<select id="reportcalendarid"></select>');
                        $select.append($("<option />"));
                        data.dictionaries.repType.forEach(function (reptype) {
                            var $optgroup = $("<optgroup label='" + reptype.repTypeName + "' />");
                            data.dictionaries.repTypeCalendar
                                .filter(function (item) {
                                    return item.repTypeId == reptype.repTypeId;
                                })
                                .forEach(function (reptypecalendar) {
                                    $("<option />", {
                                        value: reptypecalendar.repTypeCalendarId,
                                        text: Asyst.date.format(reptypecalendar.repStartDate) + ' - ' + Asyst.date.format(reptypecalendar.repEndDate)
                                    }).appendTo($optgroup);
                                });
                            $optgroup.appendTo($select);
                        });
                        $select.on('change', function(){
                            if (!this.value) { this.value = "null"; }
                            if (callback) { callback(this.value); }
                        });
                        $liparent.after($li.append($select));
                        $select.chosen({width: '200px', language:'ru', allow_single_deselect:true, disable_search_threshold: 10, no_results_text:'Ничего не найдено!', placeholder_text_single:'Выберите отчет'});
                        $select.parent().find('a.chosen-single').css('border-color','#999');
                    } else {
                        if (callback) { callback(null); }
                    }
                } else {
                    if (callback) { callback(null); }
                }
                return $li;
            };
            function report_filter(reportcalendarid){
                var reps = [];
                data.nodes.forEach(function(d, index){
                    if (reportcalendarid) {
                        d.reportstatusterm = -1;
                        if (d.repReport) {
                            d.repReport.forEach(function(report){
                                if (report.repTypeCalendarId == reportcalendarid){
                                    if (!report.Term || report.Term == "null") { report.Term = 0; }
                                    if (reps.indexOf(report.Term) < 0) { reps.push(report.Term) }
                                    d.reportstatusterm = report.Term;
                                    data.mini[index].reportstatusterm = report.Term;
                                }
                            });
                        }
                    }
                });
                return reps;
            };
            */

            /*-------*/
            /*buttons*/
            /*-------*/

            /*apply filter*/
            $lir = $('<li></li>');
            $btn = $('<div class="i-btn"><div class="i i-filter"></div></div>');
            $btn.tooltip({
                html: true,
                title: 'Применить фильтр',
                container: 'body',
                placement: 'top',
                trigger: 'hover'
            });
            self.dom.panel_filter.find('.' + self.class.panel_filter_buttons).append($lir.append($btn));
            self.filter_obj.objects.btn_apply_filter = $btn;

            /*clear filter*/
            $lir = $('<li></li>');
            $btn = $('<div class="i-btn"><div class="i i-remove"></div></div>');
            $btn.tooltip({
                html: true,
                title: 'Очистить фильтр',
                container: 'body',
                placement: 'top',
                trigger: 'hover'
            });
            self.dom.panel_filter.find('.' + self.class.panel_filter_buttons).append($lir.append($btn));
            self.filter_obj.objects.btn_clear_filter = $btn;

            /*show-hide legend*/
            $lir = $('<li></li>');
            $btn = $('<div class="i-btn"><div class="i i-bars"></div></div>');
            $btn.tooltip({
                html: true,
                title: 'Скрыть / показать легенду',
                container: 'body',
                placement: 'top',
                trigger: 'hover'
            });
            self.dom.panel_filter.find('.' + self.class.panel_filter_buttons).append($lir.append($btn));
            self.filter_obj.objects.btn_legend = $btn;

            /*show-hide info*/
            $lir = $('<li></li>');
            $btn = $('<div class="i-btn"><div class="i i-arrowright"></div></div>');
            $btn.tooltip({
                html: true,
                title: 'Скрыть / показать панель информации',
                container: 'body',
                placement: 'top',
                trigger: 'hover'
            });
            self.dom.panel_filter.find('.' + self.class.panel_filter_buttons).append($lir.append($btn));
            self.filter_obj.objects.btn_info = $btn;

            /*-------------*/
            /*filter fileds*/
            /*-------------*/

            /*filter fields*/
            self.filter_obj.filter.forEach(function(d){
                var $li = $('<li></li>');
                if (d.type == 'select') {
                    var $select = $('<select ' + (d.multiple ? 'multiple' : '') + ' data-type="select" data-dictionary="' + d.dictionary + '" data-multiple="' + d.multiple + '" data-id="' + d.id + '" data-name="' + d.name + '" data-placeholder="' + d.placeholder + '"></select>');
                    var $empty_option;
                    if (d.multiple) {
                        $empty_option = $("<option />", { value: "", text: "[Без значения]" });
                        $select.append($empty_option);
                    } else {
                        $empty_option = $("<option />", { value: "", text: "" });
                        $select.append($empty_option);
                    }
                    self.dom.panel_filter.find('.' + self.class.panel_filter_filters).append($li.append($select));
                    if (d.multiple) {
                        $select.multipleSelect({
                            width: d.width,
                            filter: true,
                            addTitle: true,
                            noMatchesFound: "Ничего не найдено!",
                            selectAllText: "Выбрать все",
                            allSelected: "Выбрано все",
                            countSelected: "Выбрано # из %",
                            minimumCountSelected: 1,
                            multiple: false,
                            onClose: function() {},
                        });
                    } else {
                        $select.chosen({width: d.width, language:'ru', allow_single_deselect:true, no_results_text:'Ничего не найдено!'});
                    }
                    self.filter_obj.objects.input_filters.push({ id: d.id, type: d.type, multiple: d.multiple, li: $li, input: $select });
                }
                if (d.type == 'input') {
                    var $input = $('<input type="text" data-type="input" class="filter-input" placeholder="' + d.placeholder + '">');
                    self.dom.panel_filter.find('.' + self.class.panel_filter_filters).append($li.append($input));
                    $input.width(d.width);
                    self.filter_obj.objects.input_filters.push({ id: d.id, type: d.type, li: $li, input: $input });
                }
            });
        };
        ktDom.prototype.filter_bind_events = function(){
            var self = this,
                chart = self.chart,
                options = self.chart.options,
                objects = self.chart.objects,
                functions = self.chart.functions,
                data = self.chart.options.data;

            self.filter_obj.objects.select_y.on('change', function(){
                var that = this;
                options.yCurrent = that.value;
                self.loader_add("#wrapper", "change_y", "Обновление диаграммы");
                setTimeout(function() {
                    chart.graph_calculate();
                    chart.graph_render_yaxis();
                    chart.graph_show_nodes();
                    chart.brush_calculate();
                    chart.brush_render_yaxis();
                    chart.brush_show_nodes();
                    self.loader_remove("change_y");
                    self.loader_add("#wrapper", "update_filtered_panel", "Обновление панели информации");
                    setTimeout(function() {
                        self.info_filtered_render();
                        self.loader_remove("update_filtered_panel");
                    }, 10);
                }, 10);
            });
            self.filter_obj.objects.select_color.on('change', function(){
                var that = this,
                    id = that.id;
                functions.color = functions.colors[that.value];
                options.colorField = options.colorFields[that.value];
                self.loader_add(".panel-graph", "change_color", "Обновление");
                setTimeout(function(){
                    chart.graph_show_nodes();
                    self.legend_render();
                    self.loader_remove("change_color");
                }, 10);
                /*
                 if (this.value == "colorByReportCalendarId"){
                 self.dom.select_report_calendar = select_reportCalendar($li,
                 function(reportcalendarid){
                 remove_filter(id);
                 var values = report_filter(reportcalendarid);
                 render_legend();
                 add_filter(id, 'reportstatusterm', 'equal', values);
                 set_filter();
                 apply_filter();
                 }
                 );
                 } else {
                 render_legend();
                 if (self.dom.select_report_calendar) {
                 self.dom.select_report_calendar.remove();
                 }
                 if (has_filter(id)) {
                 remove_filter(id);
                 set_filter();
                 apply_filter();
                 } else {
                 self.show_nodes();
                 self.show_mnodes();
                 }
                 };
                 */
            });
            self.filter_obj.objects.btn_legend.on('click', function(){
                self.dom.panel_legend.toggleClass('hide');
                if (self.dom.panel_legend.hasClass('hide')) {
                    self.options.width_legend = 0;
                } else {
                    self.options.width_legend = self.options._width_legend;
                }
                $(window).trigger('resize');
            });
            self.filter_obj.objects.btn_info.on('click', function(){
                $(this).find('.i').toggleClass('i-arrowright');
                $(this).find('.i').toggleClass('i-arrowleft');
                self.dom.panel_info.toggleClass('hide');
                if (self.dom.panel_info.hasClass('hide')) {
                    self.options.width_info = 0;
                } else {
                    self.options.width_info = self.options._width_info;
                }
                $(window).trigger('resize');
            });
            self.filter_obj.objects.btn_clear_filter.on('click', function(){
                // set defaults
                var yCurrentOld = options.yCurrent;
                options.yCurrent = "byLevel";
                var colorCurrent = "colorByLevelId";
                functions.color = functions.colors[colorCurrent];
                options.colorField = options.colorFields[colorCurrent];

                // set selects defaults
                self.filter_obj.objects.select_y.val(options.yCurrent);
                self.filter_obj.objects.select_y.trigger("chosen:updated");
                self.filter_obj.objects.select_color.val(colorCurrent);
                self.filter_obj.objects.select_color.trigger("chosen:updated");
                // clear filter inputs
                self.filter_obj.objects.input_filters.forEach(function(obj){
                    var _input = obj.input,
                        _input_data = _input.data();
                    if (_input_data.type == "select") {
                        _input.multipleSelect('uncheckAll');
                        _input.parent().find('button.ms-choice').css('border-color','#ddd');
                    }
                    if (_input_data.type == "input") {
                        _input[0].value = "";
                    }
                });

                if (self.filter_obj.filter_apply.length > 0 || options.yCurrent != yCurrentOld) {
                    clear_all_filters();
                } else {
                    self.loader_add("#wrapper", "clear_filter_options", "Обновление диаграммы");
                    setTimeout(function(){
                        if (chart.objects.selection) {
                            chart.brush_clear_selection();
                            chart.graph_calculate();
                            chart.graph_render_xaxis();
                        }
                        chart.graph_show_nodes();
                        self.legend_render();
                        self.loader_remove("clear_filter_options");
                        self.loader_add("#wrapper", "update_filtered_panel", "Обновление панели информации");
                        setTimeout(function(){
                            self.info_filtered_render();
                            self.loader_remove("update_filtered_panel");
                        }, 10);
                    }, 10);
                }
            });
            self.filter_obj.objects.btn_apply_filter.on('click', function(){
                init_filters();
                set_filter();
                apply_filter();
            });
            self.filter_obj.objects.input_filters.forEach(function(obj){
                var _li = obj.li,
                    _input = obj.input,
                    _input_data = _input.data();
                if (_input_data.type == "select") {
                    _li.remove();
                }
                if (_input_data.type == "input") {
                    _input.on('keydown', function(e){
                        if (e.keyCode == 13) {
                            self.filter_obj.filter_old_input_value = this.value;
                            remove_filter('text');
                            add_filter('text', 'name, code, projectname, portfolioname, leadername', 'contains', [this.value]);
                            set_filter();
                            apply_filter();
                        }
                    });
                    /*
                    _input.on('keydown', function(){
                        self.filter_obj.filter_old_input_value = this.value;
                    });
                    _input.on('keyup', function(e){
                        if (this.value !== self.filter_obj.filter_old_input_value) {
                            clearTimeout(self.filter_obj.filter_timeout);
                            remove_filter('text');
                            add_filter('text', 'name, code, projectname, portfolioname, leadername', 'contains', [this.value]);
                            set_filter();
                            self.filter_obj.filter_timeout = setTimeout(apply_filter, self.filter_obj.filter_input_delay);
                        }
                    });
                    */
                }
            });
            self.filter_obj.filter.sort(function(a,b){ return b.index - a.index; }).forEach(function(d){
                var $li = $('<li></li>');
                if (d.type == 'select') {
                    var $select = $('<select ' + (d.multiple ? 'multiple' : '') + ' data-type="select" data-dictionary="' + d.dictionary + '" data-multiple="' + d.multiple + '" data-id="' + d.id + '" data-name="' + d.name + '" data-placeholder="' + d.placeholder + '"></select>');
                    var $empty_option;
                    if (d.multiple) {
                        $empty_option = $("<option />", { value: "null", text: "[Без значения]" });
                        $select.append($empty_option);
                    } else {
                        $empty_option = $("<option />", { value: "", text: "" });
                        $select.append($empty_option);
                    }
                    self.dom.panel_filter.find('.' + self.class.panel_filter_filters).prepend($li.append($select));
                    self.chart.options.data.dictionaries[d.dictionary].forEach(function(x) {
                        if (x.id) {
                            var $option = $("<option />", { value: x.id, text: x.name });
                            $select.append($option);
                        }
                    });
                    if (d.multiple) {
                        $select.multipleSelect({
                            width: d.width,
                            filter: true,
                            addTitle: true,
                            noMatchesFound: "Ничего не найдено!",
                            selectAllText: "Выбрать все",
                            allSelected: "Выбрано все",
                            countSelected: "Выбрано # из %",
                            minimumCountSelected: 1,
                            multiple: false,
                            /*
                            onClose: function() {
                                var values = $select.multipleSelect('getSelects'); //array of text values
                                remove_filter(d.id);
                                if (values.length > 0) {
                                    add_filter(d.id, d.id, 'equal', values);
                                    $select.parent().find('button.ms-choice').css('border-color','#999');
                                } else {
                                    $select.parent().find('button.ms-choice').css('border-color','#ddd');
                                }
                            }
                            */
                        });
                    } else {
                        $select.on('change', function(){
                            remove_filter(d.id);
                            if (this.value) {
                                add_filter(d.id, d.id, 'equal', [this.value]);
                                $(this).parent().find('a.chosen-single').css('border-color','#999');
                            } else {
                                $(this).parent().find('a.chosen-single').css('border-color','#ddd');
                            }
                        });
                        $select.chosen({width: d.width, language:'ru', allow_single_deselect:true, no_results_text:'Ничего не найдено!'});
                    }
                    var f = self.filter_obj.objects.input_filters.filter(function(f){ return f.id == d.id; });
                    if (f.length > 0) {
                        f = f[0];
                        f.li = $li;
                        f.input = $select;
                    }
                }
            });

            function has_filter(id){
                var result = false;
                self.filter_obj.filter_apply.forEach(function(d){
                    if (d.id == id)
                        result = true;
                });
                return result;
            };
            function remove_filter(id){
                self.filter_obj.filter_apply = self.filter_obj.filter_apply.filter(function(d) {
                    return d.id !== id;
                });
            };
            function add_filter(id, fields, method, values){
                self.filter_obj.filter_apply.push({
                    id: id,
                    fields: fields.split(','),
                    method: method,
                    values: values,
                });
            };
            function set_filter(){
                //set all filtered
                data.nodes.forEach(function(d){ d._filtered = true; });
                data.links.forEach(function(d){ d._filtered = true; });
                //apply filter for nodes

                //filter nodes
                self.filter_obj.filter_apply.forEach(function(f){
                    if (f.method == 'equal') {
                        data.nodes
                            .filter(function(d){ return d._filtered; })
                            .forEach(function(d){
                                d._filtered = false;
                                f.values.forEach(function(fvalue){
                                    if (fvalue == "null") {
                                        if (d[f.fields[0]] == null)
                                            d._filtered = true;
                                    } else {
                                        if (d[f.fields[0]] == fvalue)
                                            d._filtered = true;
                                    }
                                });
                            });
                    } else if (f.method == 'contains') {
                        data.nodes
                            .filter(function(d){ return d._filtered; })
                            .forEach(function(d){
                                d._filtered = false;
                                f.fields.forEach(function(ffield){
                                    if (d[ffield.trim()])
                                        if (d[ffield.trim()].toLowerCase().includes(f.values[0].toLowerCase()))
                                            d._filtered = true;
                                });
                            });
                    }
                });
                //filter links
                data.links.filter(function(d){ return d._filtered; })
                    .forEach(function(d){ d._filtered = d.source._filtered && d.target._filtered; });
            };
            function apply_filter(){
                self.loader_add("#wrapper", "filtering", "Обновление диаграммы");
                setTimeout(function(){
                    chart.get_nodes_filtered();
                    chart.visible_nodes_filtered();

                    chart.data_extend_for_y_scalable_filtered();
                    chart.data_extend_for_y_scalable_filtered_mini();
                    if (data.filtered.length > 0) {
                        chart.graph_calculate();
                        chart.graph_render_yaxis();
                        chart.brush_calculate();
                        chart.brush_render_yaxis();
                    }
                    chart.graph_show_nodes();
                    chart.brush_show_nodes();

                    self.legend_render();
                    self.loader_remove("filtering");
                    self.loader_add("#wrapper", "update_filtered_panel", "Обновление панели информации");
                    setTimeout(function(){
                        self.info_filtered_render();
                        self.loader_remove("update_filtered_panel");
                    }, 10);
                }, 10);
            };
            function init_filters(){
                self.filter_obj.objects.input_filters.forEach(function(d){
                    if (d.type == 'select') {
                        if (d.multiple) {
                            var values = d.input.multipleSelect('getSelects'); //array of text values
                            remove_filter(d.id);
                            if (values.length > 0) {
                                add_filter(d.id, d.id, 'equal', values);
                                d.input.parent().find('button.ms-choice').css('border-color','#999');
                            } else {
                                d.input.parent().find('button.ms-choice').css('border-color','#ddd');
                            }
                        }
                    } else if (d.type == 'input') {
                        self.filter_obj.filter_old_input_value = d.input.val();
                        remove_filter('text');
                        add_filter('text', 'name, code, projectname, portfolioname, leadername', 'contains', [d.input.val()]);
                        set_filter();
                        apply_filter();
                    }
                });
            };
            function clear_all_filters(){
                self.filter_obj.filter_apply = [];
                chart.brush_clear_selection();
                set_filter();
                apply_filter();
            };
        };

        ktDom.prototype.legend_create = function(){
            var self = this;
            self.dom.panel_legend.css('top', self.dom.panel_filter.height());
        };
        ktDom.prototype.legend_render = function(){
            var self = this,
                chart = self.chart,
                options = self.chart.options,
                objects = self.chart.objects,
                functions = self.chart.functions,
                data = self.chart.options.data;

            self.dom.panel_legend.html('');
            data.nodes.forEach(function(d){ d._visible_legend = true; });
            data.mini.forEach(function(d){ d._visible_legend = true; });
            data.links.forEach(function(d){ d._visible_legend = true; });
            data.dictionaries[options.colorField.dictionary].forEach(function (x) {
                //extend legend item properties
                x[options.colorField.id] = x.id;
                if (options.colorField.id == "reportstatusterm") { x.name = functions.getReportStatusTermName(x); }
                if (!x.name) { x.name = '<пусто>'; }

                if (data.filtered.filter(function(d){ return d[options.colorField.id] == x.id; }).length > 0) {
                    //render legend item
                    var $legend_item = $('<div class="legend-item"></div>');
                    var $legend_circle = $('<div class="legend-circle"></div>');
                    $legend_circle.css('background-color', functions.color(x));
                    $legend_circle.css('border-color', functions.color(x));
                    var $legend_name = $('<div class="legend-name"></div>');
                    $legend_name.text(x.name);
                    $legend_item.append($legend_circle, $legend_name);
                    $legend_item.data('visible', true);

                    //bind legend item click
                    $legend_item.on('click', function(){
                        $(this).toggleClass('legend-hidden');
                        var visible = $(this).data('visible');
                        $(this).data('visible', !visible);
                        //filter nodes
                        data.nodes
                            .filter(function(d){ return d[options.colorField.id] == x.id })
                            .forEach(function(d){ d._visible_legend = !visible; });
                        //filter mini nodes
                        data.mini
                            .filter(function(d){ return d[options.colorField.id] == x.id })
                            .forEach(function(d){ d._visible_legend = !visible; });
                        //filter links
                        data.links.forEach(function(d){ d._visible_legend = d.source._visible_legend && d.target._visible_legend; });
                        //update
                        chart.graph_show_nodes();
                        chart.brush_show_nodes();
                    });
                    self.dom.panel_legend.append($legend_item);
                }
            });
        };

        ktDom.prototype.info_create = function(){
            var self = this,
                chart = self.chart;
            // tabs
            self.dom.panel_info_header_nav_tabs.append( self.dom.panel_info_header_tabs.filtered, self.dom.panel_info_header_tabs.selected );
            self.dom.panel_info_header.append(self.dom.panel_info_header_nav_tabs);
            // tabs content
            self.dom.panel_info_body_tab_content.append( self.dom.panel_info_body_tabs.filtered, self.dom.panel_info_body_tabs.selected );
            self.dom.panel_info_body.append(self.dom.panel_info_body_tab_content);
            // panel-info
            self.dom.panel_info.append(self.dom.panel_info_header, self.dom.panel_info_body);
        };
        ktDom.prototype.info_bind_events = function(){
            var self = this,
                chart = self.chart,
                data = self.chart.options.data;
            /*tabs events click*/
            self.dom.panel_info_header_tabs.filtered
                .on("click", function(){
                    chart.visible_nodes_filtered();
                    chart.graph_show_nodes(0);
                    chart.brush_show_nodes(0);
                });
            self.dom.panel_info_header_tabs.selected
                .on("click", function(){
                    chart.visible_nodes_selected();
                    chart.graph_show_nodes(0);
                    chart.brush_show_nodes(0);
                });
            self.dom.panel_info_header_tabs.connected
                .on("click", function(){
                    chart.get_nodes_connected(data.connected_n);
                    chart.visible_nodes_connected();
                    chart.graph_show_nodes(0);
                    chart.brush_show_nodes(0);
                    self.info_connected_render(data.connected_n);
                })
                .on("mouseover", function() {
                    chart.node_mouseover(data.connected_n);
                })
                .on("mouseout", function() {
                    chart.node_mouseout(data.connected_n);
                });
        };
        ktDom.prototype.info_filtered_render = function(){
            var self = this,
                chart = self.chart,
                options = self.chart.options,
                data = self.chart.options.data,
                functions = self.chart.functions;

            //render tab info
            self.dom.panel_info_header_tabs.filtered.find('a').text('Точки (' + data.filtered.length + ')');

            /*render tab content*/
            var $ul = $('<ul></ul>');
            data.dictionaries[options.yTickData].forEach(function(dat){
                var count = data.filtered.filter(function(d){ return d[options.yfieldId] == dat.id; }).length,
                    count_selected = data.filtered.filter(function(d){ return d[options.yfieldId] == dat.id && d._selected; }).length;
                if (count > 0) {
                    var $li = $(
                        '<li class="sub-menu dcjq-parent-li" data-y=' + dat.id + '>' +
                        '  <a href="javascript:;" class="dcjq-parent">' +
                        '    <span>' + dat.name + '</span>' +
                        '    <span class="counts">' +
                        '       <span class="dcjq-count selected">' + (count_selected > 0 ? count_selected : "") + '</span>' +
                        '       <span class="dcjq-count" style="color:' + functions.colorCounts(dat.id) + ';">' + count + '</span>' +
                        '    </span>' +
                        '  </a>' +
                        '  <ul class="sub" style="display: none;">' +
                        '  </ul>' +
                        '</li>'
                    );
                    data.filtered.filter(function(d){ return d[options.yfieldId] == dat.id; }).forEach(function(d){
                        var $itm = $('<li data-pointid="' + d.pointid + '"></li>');
                        var $lnk = $('<a href="javascript:;" data-pointid="' + d.pointid + '">' + d.code + '. ' + d.name + '</a>')
                            .attr('class', d._selected ? 'selected' : '');
                        var $btn = $('<div class="btn btn-xs show-kt-info">Подробнее</div>');
                        $lnk.on('click', function(){
                                if (d)
                                    if (d._visible && d._visible_legend)
                                        if (window.event.ctrlKey) {
                                            chart.node_select(d);
                                            chart.node_mouseout(d);
                                        } else {
                                            chart.node_open(d);
                                        }
                            })
                            .on("contextmenu", function(e){
                                e.preventDefault();
                                if (d)
                                    if (d._visible && d._visible_legend)
                                        chart.node_select(d);
                                self.node_mouseout(d);
                            })
                            .on("mouseover", function() {
                                if (d)
                                    if (d._visible && d._visible_legend)
                                        chart.node_mouseover(d);
                            })
                            .on("mouseout", function() {
                                if (d)
                                    if (d._visible && d._visible_legend)
                                        chart.node_mouseout(d);
                            });
                        $btn.on('click', function(e){
                            e.stopPropagation();
                        });
                        $li.find('ul.sub').append($itm.append($lnk));
                    });
                    $ul.append($li);
                }
            });
            self.dom.panel_info_body_tabs.filtered.html('');
            self.dom.panel_info_body_tabs.filtered.append($ul);
            if ($.fn.dcAccordion) {
                $ul.dcAccordion({
                    menuClose: false,
                    eventType: 'click',
                    autoClose: false,
                    saveState: true,
                    disableLink: true,
                    speed: '50',
                    showCount: false,
                    autoExpand: true,
                    classExpand: 'dcjq-current-parent'
                });
            };
        };
        ktDom.prototype.info_filtered_update = function(_d){
            var self = this,
                chart = self.chart,
                objects = self.chart.objects,
                options = self.chart.options,
                data = self.chart.options.data,
                dimentions = self.chart.dimentions,
                functions = self.chart.functions;
            var count_selected = data.filtered.filter(function(d){ return d[options.yfieldId] == _d[options.yfieldId] && d._selected; }).length;
            self.dom.panel_info_body_tabs.filtered.find('a[data-pointid=' + _d.pointid + ']').toggleClass('selected');
            self.dom.panel_info_body_tabs.filtered.find('li[data-y=' + _d[options.yfieldId] + '] .dcjq-count.selected').text(count_selected > 0 ? count_selected : "");
        };
        ktDom.prototype.info_selected_render = function(){
            var self = this,
                chart = self.chart,
                objects = self.chart.objects,
                options = self.chart.options,
                data = self.chart.options.data,
                functions = self.chart.functions;

            /*render tab info*/
            self.dom.panel_info_header_tabs.selected.find('a').text('Выбранные (' + data.selected.length + ')');

            /*render tab content*/
            var $ul = $('<ul></ul>');
            var $li = $(
                '<li class="sub-menu dcjq-parent-li">' +
                '  <a href="javascript:;" class="dcjq-parent">' +
                '    <span>Выбранные точки</span>' +
                '    <span class="counts">' +
                '       <div class="btn btn-xs" id="clear_selected">Очистить</div>' +
                '       <div class="btn btn-xs" id="join_selected">Соединить</div>' +
                '    </span>' +
                '  </a>' +
                '  <ul class="sub" id="draggable">' +
                '  </ul>' +
                '</li>'
            );
            $li.find('#clear_selected').click(function(e){
                e.stopPropagation();
                chart.clear_nodes_selected();
            });
            $li.find('#join_selected').click(function(e){
                e.stopPropagation();
                chart.on_connect();
            });
            var $itm = $('<li class="nodata"></li>');
            var $lnk = $('<a>Не выбрано ни одной точки</a>');
            $li.find('ul.sub').append($itm.append($lnk));
            $ul.append($li);
            self.dom.panel_info_body_tabs.selected.html('');
            self.dom.panel_info_body_tabs.selected.append($ul);
            if ($.fn.dcAccordion) {
                $ul.dcAccordion({
                    menuClose: false,
                    eventType: 'click',
                    autoClose: false,
                    saveState: true,
                    disableLink: true,
                    speed: '50',
                    showCount: false,
                    autoExpand: true,
                    classExpand: 'dcjq-current-parent'
                });
            };
            $ul.find('li.sub-menu > a').trigger('click');

            /*
             make selected points draggable
             https://github.com/RubaXa/Sortable
             */
            var drag = document.getElementById('draggable');
            Sortable.create(drag, {
                group: 'selected',
                animation: 100,
                onUpdate: function(evt){
                    var node = data.selected[evt.oldIndex];
                    data.selected.splice(evt.oldIndex, 1);
                    data.selected.splice(evt.newIndex, 0, node);
                }
            });
        };
        ktDom.prototype.info_selected_update = function(_d){
            var self = this,
                chart = self.chart,
                objects = self.chart.objects,
                options = self.chart.options,
                data = self.chart.options.data,
                functions = self.chart.functions;

            /*update tab info*/
            self.dom.panel_info_header_tabs.selected.find('a').text('Выбранные (' + data.selected.length + ')');

            /*update tab content*/
            var $itm, $lnk, level;
            var $ul = self.dom.panel_info_body_tabs.selected.find('ul.sub');
            if (data.selected.length > 0) {
                level = _d.level;
                if (_d._selected) {
                    if (data.selected.length == 1)
                        $ul.find('li.nodata').remove();

                    $itm = $('<li data-pointid="' + _d.pointid + '"></li>');
                    $lnk = $('<a href="javascript:;" data-pointid="' + _d.pointid + '">' + _d.code + '. ' + _d.name + '</a>')
                        .attr('class', _d._selected ? 'selected' : '');

                    $lnk.on('click', function(){
                            if (window.event.ctrlKey) {
                                chart.node_select(_d);
                                chart.node_mouseout(_d);
                            } else {
                                chart.node_open(_d);
                            }
                        })
                        .on("contextmenu", function(e){
                            e.preventDefault();
                            chart.node_select(_d);
                            chart.node_mouseout(_d);
                        })
                        .on("mouseover", function() {
                            chart.node_mouseover(_d);
                        })
                        .on("mouseout", function() {
                            chart.node_mouseout(_d);
                        });

                    $ul.append($itm.append($lnk));
                } else {
                    $ul.find('li[data-pointid=' + _d.pointid + ']').remove();
                }
            } else {
                $itm = $('<li class="nodata"></li>');
                $lnk = $('<a>Не выбрано ни одной точки</a>');
                $ul.html('').append($itm.append($lnk));
            }
        };
        ktDom.prototype.info_connected_render = function(_d){
            var self = this,
                chart = self.chart;
            if (self.dom.panel_info_header_nav_tabs.find('li').length == 2){
                self.dom.panel_info_header_nav_tabs.append(self.dom.panel_info_header_tabs.connected);
                self.dom.panel_info_body_tab_content.append(self.dom.panel_info_body_tabs.connected);
                self.dom.panel_info_body_tabs.connected.html('');

                var $ktinfo = $('<div class="ktinfo"></div>');
                var $ktsource = $('<div class="ktsource"></div>');
                var $kttarget = $('<div class="kttarget"></div>');

                self.dom.panel_info_body_tabs.connected.append($ktinfo);
                self.dom.panel_info_body_tabs.connected.append($ktsource);
                self.dom.panel_info_body_tabs.connected.append($kttarget);

                /*render tab content source*/
                var $sul = $('<ul></ul>');
                var $sli = $(
                    '<li class="sub-menu dcjq-parent-li">' +
                    '  <a href="javascript:;" class="dcjq-parent">' +
                    '    <span>Предшественники</span>' +
                    '    <span class="counts">' +
                    '       <span class="dcjq-count selected"></span>' +
                    '       <span class="dcjq-count"></span>' +
                    '    </span>' +
                    '  </a>' +
                    '  <ul class="sub">' +
                    '  </ul>' +
                    '</li>'
                );
                var $sitm = $('<li class="nodata"></li>');
                var $slnk = $('<a>Нет точек</a>');
                $sli.find('ul.sub').append($sitm.append($slnk));
                $sul.append($sli);
                $ktsource.append($sul);
                if ($.fn.dcAccordion) {
                    $sul.dcAccordion({
                        menuClose: false,
                        eventType: 'click',
                        autoClose: false,
                        saveState: true,
                        disableLink: true,
                        speed: '50',
                        showCount: false,
                        autoExpand: true,
                        classExpand: 'dcjq-current-parent'
                    });
                };
                //$sul.find('li.sub-menu > a').trigger('click');

                /*render tab content target*/
                var $tul = $('<ul></ul>');
                var $tli = $(
                    '<li class="sub-menu dcjq-parent-li">' +
                    '  <a href="javascript:;" class="dcjq-parent">' +
                    '    <span>Последователи</span>' +
                    '    <span class="counts">' +
                    '       <span class="dcjq-count selected"></span>' +
                    '       <span class="dcjq-count"></span>' +
                    '    </span>' +
                    '  </a>' +
                    '  <ul class="sub">' +
                    '  </ul>' +
                    '</li>'
                );
                var $titm = $('<li class="nodata"></li>');
                var $tlnk = $('<a>Нет точек</a>');
                $tli.find('ul.sub').append($titm.append($tlnk));
                $tul.append($tli);
                $kttarget.append($tul);
                if ($.fn.dcAccordion) {
                    $tul.dcAccordion({
                        menuClose: false,
                        eventType: 'click',
                        autoClose: false,
                        saveState: true,
                        disableLink: true,
                        speed: '50',
                        showCount: false,
                        autoExpand: true,
                        classExpand: 'dcjq-current-parent'
                    });
                };
                //$tul.find('li.sub-menu > a').trigger('click');
            }
            self.info_connected_render_list(_d);
        };
        ktDom.prototype.info_connected_update = function(_d){
            var self = this,
                chart = self.chart,
                objects = self.chart.objects,
                options = self.chart.options,
                data = self.chart.options.data,
                dimentions = self.chart.dimentions,
                functions = self.chart.functions;

            var $kttarget = self.dom.panel_info_body_tabs.connected.find('.kttarget');
            var $ktsource = self.dom.panel_info_body_tabs.connected.find('.ktsource');

            var count_selected_s = data.connected_s.filter(function(obj){ return obj._selected; }).length;
            $ktsource.find('.dcjq-count').text(data.connected_s.length);
            $ktsource.find('.dcjq-count.selected').text(count_selected_s > 0 ? count_selected_s : '');
            var count_selected_t = data.connected_t.filter(function(obj){ return obj._selected; }).length;
            $kttarget.find('.dcjq-count').text(data.connected_t.length);
            $kttarget.find('.dcjq-count.selected').text(count_selected_t > 0 ? count_selected_t : '');

            if (_d) {
                self.dom.panel_info_body_tabs.connected.find('a[data-pointid=' + _d.pointid + ']').toggleClass('selected');
            } else {
                data.connected_s.forEach(function(d){
                    return d.selected ?
                        self.dom.panel_info_body_tabs.connected.find('a[data-pointid=' + d.pointid + ']').addClass('selected') :
                        self.dom.panel_info_body_tabs.connected.find('a[data-pointid=' + d.pointid + ']').removeClass('selected');
                });
                data.connected_t.forEach(function(d){
                    return d.selected ?
                        self.dom.panel_info_body_tabs.connected.find('a[data-pointid=' + d.pointid + ']').addClass('selected') :
                        self.dom.panel_info_body_tabs.connected.find('a[data-pointid=' + d.pointid + ']').removeClass('selected');
                });
            }
        };
        ktDom.prototype.info_connected_render_list = function(_d){
            var self = this,
                chart = self.chart,
                objects = self.chart.objects,
                options = self.chart.options,
                data = self.chart.options.data,
                dimentions = self.chart.dimentions,
                functions = self.chart.functions;

            /*update tab info*/
            self.dom.panel_info_header_tabs.connected.find('a span').text(_d.code + ". " + _d.name);

            var $ktinfo = self.dom.panel_info_body_tabs.connected.find('.ktinfo');
            var $kttarget = self.dom.panel_info_body_tabs.connected.find('.kttarget');
            var $ktsource = self.dom.panel_info_body_tabs.connected.find('.ktsource');

            /*update tab content info*/
            $ktinfo.html('');
            $ktinfo.append('<div class="trow"><div class="name">Название</div><div class="value"><a href="/asyst/Point/form/auto/' + _d.pointid + '?mode=view&back=/asyst/page/ktChart">' + _d.code + '. ' + _d.name + '</a></div></div>');
            $ktinfo.append('<div class="trow"><div class="name">Ответственный</div><div class="value">' + _d.leadername + '</div></div>');
            $ktinfo.append('<div class="trow"><div class="name">Дата</div><div class="value">' + _d._date + '</div></div>');
            $ktinfo.append('<div class="trow"><div class="name">Статус</div><div class="value">' + _d.statusname + '</div></div>');
            $ktinfo.append('<div class="trow"><div class="name">Проект</div><div class="value">' + _d.projectname + '</div></div>');
            $ktinfo.append('<div class="trow"><div class="name">Портфель</div><div class="value">' + _d.portfolioname + '</div></div>');

            /*update tab content source*/
            var $sitm, $sbtn, $slnk;
            var $sul = $ktsource.find('ul.sub');
            $sul.html('');
            if (data.connected_s.length > 0) {
                var count_selected_s = data.connected_s.filter(function(obj){ return obj._selected; }).length;
                $ktsource.find('.dcjq-count').text(data.connected_s.length);
                $ktsource.find('.dcjq-count.selected').text(count_selected_s > 0 ? count_selected_s : '');
                data.connected_s.forEach(function(d){
                    $sitm = $('<li data-pointid="' + d.pointid + '"></li>');
                    $sbtn = $('<div class="btn btn-xs" data-source-pointid="' + d.pointid + '" data-target-pointid="' + _d.pointid + '">Разъединить</div>');
                    $slnk = $('<a href="javascript:;" data-pointid="' + d.pointid + '">' + d.code + '. ' + d.name + '</a>')
                        .attr('class', d._selected ? 'selected' : '');

                    $sbtn.on('click', function(){
                        var tdata = $(this).data();
                        chart.on_disconnect(_d, tdata.sourcePointid, tdata.targetPointid);
                    });
                    $slnk.on('click', function(){
                            if (window.event.ctrlKey) {
                                chart.node_select(d);
                                chart.node_mouseout(d);
                            } else {
                                chart.node_open(d);
                            }
                        })
                        .on("contextmenu", function(e){
                            e.preventDefault();
                            chart.node_select(d);
                            chart.node_mouseout(d);
                        })
                        .on("mouseover", function() {
                            chart.node_mouseover(d);
                        })
                        .on("mouseout", function() {
                            chart.node_mouseout(d);
                        });

                    $sul.append($sitm.append($sbtn, $slnk));
                });
            } else {
                $ktsource.find('.dcjq-count').text('');
                $sitm = $('<li class="nodata"></li>');
                $slnk = $('<a>Нет точек</a>');
                $sul.append($sitm.append($slnk));
            }

            /*update tab content target*/
            var $titm, $tbtn, $tlnk;
            var $tul = $kttarget.find('ul.sub');
            $tul.html('');
            if (data.connected_t.length > 0) {
                var count_selected_t = data.connected_t.filter(function(obj){ return obj._selected; }).length;
                $kttarget.find('.dcjq-count').text(data.connected_t.length);
                $kttarget.find('.dcjq-count.selected').text(count_selected_t > 0 ? count_selected_t : '');
                data.connected_t.forEach(function(d){
                    $titm = $('<li data-pointid="' + d.pointid + '"></li>');
                    $tbtn = $('<div class="btn btn-xs" data-source-pointid="' + _d.pointid + '" data-target-pointid="' + d.pointid + '">Разъединить</div>');
                    $tlnk = $('<a href="javascript:;" data-pointid="' + d.pointid + '">' + d.code + '. ' + d.name + '</a>')
                        .attr('class', d._selected ? 'selected' : '');

                    $tbtn.on('click', function(){
                        var tdata = $(this).data();
                        chart.on_disconnect(_d, tdata.sourcePointid, tdata.targetPointid);
                    });
                    $tlnk.on('click', function(){
                            if (window.event.ctrlKey) {
                                chart.node_select(d);
                                chart.node_mouseout(d);
                            } else {
                                chart.node_open(d);
                            }
                        })
                        .on("contextmenu", function(e){
                            e.preventDefault();
                            chart.node_select(d);
                            chart.node_mouseout(d);
                        })
                        .on("mouseover", function() {
                            chart.node_mouseover(d);
                        })
                        .on("mouseout", function() {
                            chart.node_mouseout(d);
                        });

                    $tul.append($titm.append($tbtn, $tlnk));
                });
            } else {
                $kttarget.find('.dcjq-count').text('');
                $titm = $('<li class="nodata"></li>');
                $tlnk = $('<a>Нет точек</a>');
                $tul.append($titm.append($tlnk));
            }
        };

        /*
        var info_filtered = new infoFiltered();
        info_filtered.test();

        var infoFiltered = (function(){
            function infoFiltered(){};
            infoFiltered.prototype.test = function(){
                console.log('test class in class');
            };
            return infoFiltered;
        })();
        */

        ktDom.prototype.info_show_tab = function(id){
            var self = this;
            self.dom.panel_info_header_tabs[id].trigger('click');
            self.dom.panel_info_header_tabs[id].find('a').tab('show');
        };

        ktDom.prototype.loader_add = function(selector, id, text){
            var self = this;
            if (self.loaders.filter(function(l){ return l.id == id || l.selector == selector}).length == 0) {
                var _loader = self.dom.panel_loader.clone().append(
                    self.dom.spinner_overlay.clone(),
                    self.dom.spinner_container.clone().append(
                        self.dom.spinner.clone(),
                        self.dom.spinner_text.clone().text(text)
                    )
                );
                $(selector).append(_loader);
                self.loaders.push({
                    id: id,
                    selector: selector,
                    loader: _loader,
                    timer: Date.now()
                });
            }
        };
        ktDom.prototype.loader_remove = function(id) {
            var self = this;
            self.loaders.forEach(function(d, i){
                if (d.id == id) {
                    d.loader.remove();
                    self.loaders.splice(i, 1);
                    console.log(Date.now() - d.timer + ' ms ' + d.id);
                }
            });
        };

        ktDom.prototype.resize = function(){
            var self = this;
            self.dom.panel_filter.css('right', self.options.width_info);
            self.dom.panel_legend.css('right', self.options.width_info).css('width', self.options.width_legend).css('top', self.dom.panel_filter.height());
            self.dom.panel_graph.css('right', (self.options.width_info + self.options.width_legend)).css('top', self.dom.panel_filter.height());
            self.dom.panel_info.css('width', self.options.width_info);
        };

        return ktDom;
    })();
    var ktOptions = root.ktOptions = (function(){ // [CHANGE] Класс ktOptions кладу также и в неймспейс помимо изначальной переменной
        function ktOptions(root, onConnect, onDisconnect){
            this.ktdom = root.ktdom;
            this.data = root.data;
            this.onConnect = onConnect;
            this.onDisconnect = onDisconnect;

            //this.filter_obj = root.ktdom.filter_obj;

            this.margin = { top: 25, right: 20, bottom: 150, left: 20 };
            this.miniHeight = this.margin.bottom - 25;
            this.durationCount = 500;
            this.nodeRaius = 3;
            this.opacity = { in: 1, link: .75, out: 0 };
            this.today = new Date();
            this.yMaxCaptionCount = 17;
            this.yCaptionLength = 30;
        };
        return ktOptions;
    })();
    var ktChart = root.ktChart = (function(){ // [CHANGE] Класс ktChart кладу также и в неймспейс помимо изначальной переменной
        function ktChart(options){
            var self = this;
            self.options = options;
            self.options.ktdom.chart = self;
            self.options.ktdom.loader_remove("parsing");
            self.options.ktdom.loader_add("#wrapper", "rendering", "Построение диаграммы");

            setTimeout(function(){
                self.time_start(); // для отладки скорости выполнения функций

                self.init();
                self.date_locale();
                self.data_extend();
                self.data_extend_for_y_scalable();
                self.data_extend_for_y_scalable_filtered();
                self.data_extend_mini();
                self.set_dimentions();
                self.graph_build();
                self.brush_build();
                self.init_resize();

                self.options.ktdom.filter_bind_events();
                self.options.ktdom.info_bind_events();
                self.options.ktdom.legend_render();

                self.options.ktdom.info_filtered_render();
                self.options.ktdom.info_selected_render();

                self.options.ktdom.loader_remove("rendering");
            }, 10);
        };

        ktChart.prototype.time_start = function(){
            var self = this;
            self.timer2 = Date.now();
        };
        ktChart.prototype.time_console = function(text){
            var self = this;
            console.log(Date.now() - self.timer2 + ' ms ' + text);
            self.timer2 = Date.now();
        };

        ktChart.prototype.init = function(){
            var self = this,
                options = self.options;

            self.dimentions = {
                width: self.options.ktdom.dom.panel_graph.width(),
                height: self.options.ktdom.dom.panel_graph.height(),
                chartwidth: null,
                chartheight: null,
            };

            self.objects = {
                svg: null,
                main: null,
                mini: null,

                defs: null,
                def: null,
                nodes: null,
                node: null,
                links: null,
                link: null,
                xaxis: null,
                xaxis_top: null,
                yaxis: null,
                grid: null,
                today: null,

                voronoi: null,
                force: null,
                x: null,
                y: null,
                kx: null,
                ky: null,

                brusharea: null,
                brush: null,
                brushselection: null,
                mnodes: null,
                mnode: null,
                mgrid: null,
                mx: null,
                my: null,
                mforce: null,
                mtoday: null,
            };
            self.functions = {};
            self.functions.parseTimeDot = d3.timeParse("%d.%m.%Y");
            self.functions.schemeCategory10 = d3.scaleOrdinal(d3.schemeCategory10);
            self.functions.schemeCategory20 = d3.scaleOrdinal(d3.schemeCategory20);
            self.functions.schemeCategory20b = d3.scaleOrdinal(d3.schemeCategory20b);
            self.functions.schemeCategory20c = d3.scaleOrdinal(d3.schemeCategory20c);
            self.functions.colors = {
                colorByLeaderId: function(d){
                    if (d) {
                        if (typeof(d) == 'object')
                            return self.functions.schemeCategory10(d.leaderid);
                        else
                            return self.functions.schemeCategory10(d);
                    }
                    return "#888";
                },
                colorByPortfolioId: function(d){
                    if (d) {
                        if (typeof(d) == 'object')
                            return self.functions.schemeCategory10(d.portfolioid);
                        else
                            return self.functions.schemeCategory10(d);
                    }
                    return "#888";
                },
                colorByProjectId: function(d){
                    if (d) {
                        if (typeof(d) == 'object')
                            return self.functions.schemeCategory10(d.projectid);
                        else
                            return self.functions.schemeCategory10(d);
                    }
                    return "#888";
                },
                colorByLevelId: function(d){
                    var colores = ["#f655a0", "#b05df4", "#8e6bf5", "#5a97f2", "#00b7f4", "#33cc66"];
                    if (d) {
                        if (typeof(d) == 'object')
                            return colores[options.data.dictionaries.level.findIndex(function(_d){ return _d.id == d.levelid; })];
                        else
                            return colores[options.data.dictionaries.level.findIndex(function(_d){ return _d.id == d; })];
                    }
                    return "#888";
                },
                colorByStatusId: function(d){
                    var colores = ["#888", "#33cc66", "#ff4800", "#00b7f4", "#888"];
                    if (d) {
                        if (typeof(d) == 'object')
                            return colores[options.data.dictionaries.status.findIndex(function(_d){ return _d.id == d.statusid; })];
                        else
                            return colores[options.data.dictionaries.status.findIndex(function(_d){ return _d.id == d; })];
                    }
                    return "#888";
                },
                colorByReportCalendarId: function(d){
                    var colores = ["#888", "#33cc66", "#fec00f", "#ff4800"];
                    var values = ["0", "1", "2", "3"];
                    if (d) {
                        if (typeof(d) == 'object')
                            return colores[values.indexOf(d.reportstatusterm)] ? colores[values.indexOf(d.reportstatusterm)] : "#888";
                        else
                            return colores[values.indexOf(d)];
                    }
                    return "#888";
                }
            };
            self.functions.getReportStatusTermName = function(d){
                var values = ["0", "1", "2", "3"];
                var names = ["<пусто>", "Без отклонений", "Есть срывы", "Существенно просрочено"];
                if (typeof(d) == 'object')
                    return names[values.indexOf(d.reportstatusterm)] ? names[values.indexOf(d.reportstatusterm)] : "<пусто>";
                else
                    return names[values.indexOf(d)];
            };
            self.functions.yInit = {
                byLevel: function(objects){
                    options.maxY = options.maxLevel;
                    options.yfieldId = "levelid";
                    options.yfield = "_levelindex";
                    options.yfieldPosition = "_level_position_index";
                    options.yTickData = "level";
                    //self.functions.colorCounts = self.functions.colors['colorByLevelId'];
                    self.functions.colorCounts = function(){ return "#888"; };
                },
                byPortfolio: function(objects){
                    options.maxY = options.maxPortfolio_filtered;
                    options.yfieldId = "portfolioid";
                    options.yfield = "_portfolioindex_filtered";
                    options.yfieldPosition = "_portfolio_position_index";
                    options.yTickData = "portfolio_filtered";
                    //self.functions.colorCounts = self.functions.colors['colorByPortfolioId'];
                    self.functions.colorCounts = function(){ return "#888"; };
                },
                byProject: function(objects){
                    options.maxY = options.maxProject_filtered;
                    options.yfieldId = "projectid";
                    options.yfield = "_projectindex_filtered";
                    options.yfieldPosition = "_project_position_index";
                    options.yTickData = "project_filtered";
                    //self.functions.colorCounts = self.functions.colors['colorByProjectId'];
                    self.functions.colorCounts = function(){ return "#888"; };
                },
                byStatus: function(objects){
                    options.maxY = options.maxStatus_filtered;
                    options.yfieldId = "statusid";
                    options.yfield = "_statusindex_filtered";
                    options.yfieldPosition = "_status_position_index";
                    options.yTickData = "status_filtered";
                    //self.functions.colorCounts = self.functions.colors['colorByStatusId'];
                    self.functions.colorCounts = function(){ return "#888"; };
                },
                byLeader: function(objects){
                    options.maxY = options.maxLeader_filtered;
                    options.yfieldId = "leaderid";
                    options.yfield = "_leaderindex_filtered";
                    options.yfieldPosition = "_leader_position_index";
                    options.yTickData = "leader_filtered";
                    //self.functions.colorCounts = self.functions.colors['colorByLeaderId'];
                    self.functions.colorCounts = function(){ return "#888"; };
                },
            };

            self.functions.color = self.functions.colors['colorByLevelId'];

            self.options.colorFields = {
                colorByLeaderId:            { dictionary: 'leader', id: 'leaderid', name: 'leadername' },
                colorByPortfolioId:         { dictionary: 'portfolio', id: 'portfolioid', name: 'portfolioname' },
                colorByProjectId:           { dictionary: 'project', id: 'projectid', name: 'projectname' },
                colorByLevelId:             { dictionary: 'level', id: 'levelid', name: 'levelname' },
                colorByStatusId:            { dictionary: 'status', id: 'statusid', name: 'statusname' },
                colorByReportCalendarId:    { dictionary: 'reportstatus', id: 'reportstatusterm', name: 'reportstatusterm' }
            };
            self.options.colorField = self.options.colorFields['colorByLevelId'];

            self.options.today.setHours(0,0,0,0);
            self.options.yCurrent = "byLevel";
            self.options.yCurrent_ky = 1;
        };
        ktChart.prototype.init_resize = function(){
            var self = this;
            $(window).resize(function(){
                self.options.ktdom.resize();
                self.options.ktdom.loader_add("#wrapper", "resize", "Обновление");
                setTimeout(function(){
                    self.set_dimentions();
                    self.graph_resize();
                    self.brush_resize();
                    self.options.ktdom.loader_remove("resize");
                }, 10);
            });
        };

        ktChart.prototype.date_locale = function(){
            d3.timeFormatDefaultLocale({
                dateTime: "%x, %X",
                date: "%Y.%m.%d",
                time: "%H:%M:%S ",
                periods: ["AM", "PM"],
                days: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
                shortDays: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
                months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
                shortMonths: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
            })
        };
        ktChart.prototype.data_extend = function(){
            var self = this,
                options = self.options,
                functions = self.functions,
                data = self.options.data;

            data.nodes.forEach(function(d, i, arr) {
                if (!d.date) {
                    d.date = "01.01.1970";
                }
            });
            data.nodes.forEach(function(d) {
                d._date = d.date;
                d.date = functions.parseTimeDot(d.date);

                d.radius = options.nodeRaius;

                d._filtered = true;
                d._selected = false;
                d._connected = false;
                d._visible = true;
                d._visible_legend = true;
                d._viztype = 'filtered';
            });
            data.links.forEach(function(d) {
                d._filtered = true;
                d._selected = false;
                d._connected = false;
                d._visible = true;
                d._visible_legend = true;
                d.source = data.nodes[d.source];
                d.target = data.nodes[d.target];
            });

            data.filtered = [];
            data.selected = [];
            data.connected = [];
            data.connected_n = {};
            data.connected_s = [];
            data.connected_t = [];
            self.get_nodes_filtered();
        };
        ktChart.prototype.data_extend_for_y_scalable = function() {
            var self = this,
                options = self.options,
                data = self.options.data,
                dictionaries = data.dictionaries;

            data.nodes.forEach(function(d) {
                d._portfolioindex = dictionaries.portfolio.findIndex(function(_d){ return _d.id == d.portfolioid});
                d._projectindex = dictionaries.project.findIndex(function(_d){ return _d.id == d.projectid});
                d._statusindex = dictionaries.status.findIndex(function(_d){ return _d.id == d.statusid});
                d._leaderindex = dictionaries.leader.findIndex(function(_d){ return _d.id == d.leaderid});
                d._levelindex = dictionaries.level.findIndex(function(_d){ return _d.id == d.levelid});
            });

            options.maxLevel = d3.max(data.nodes, function(d) { return d._levelindex; }) + 1;
            options.maxPortfolio = d3.max(data.nodes, function(d) { return d._portfolioindex; }) + 1;
            options.maxProject = d3.max(data.nodes, function(d) { return d._projectindex; }) + 1;
            options.maxStatus = d3.max(data.nodes, function(d) { return d._statusindex; }) + 1;
            options.maxLeader = d3.max(data.nodes, function(d) { return d._leaderindex; }) + 1;

            options.pointStep = 1;

            dictionaries.level.forEach(function(d){
                var data_level = data.nodes.filter(function(_d){ return _d.levelid == d.id; });
                var data_level_date_arr = d3.nest().key(function(d){ return d.date; }).entries(data_level);
                data_level_date_arr.forEach(function(g){
                    g.values
                        .forEach(function(___d, j, array){
                            ___d._level_position = (1/(array.length+1)) * (j+1);
                            ___d._level_position_index = j;
                            options.pointStep = options.pointStep > 1/(array.length+1) ? 1/(array.length+1) : options.pointStep;
                        });
                });
            });
            dictionaries.portfolio.forEach(function(d){
                var data_portfolio = data.nodes.filter(function(_d){ return _d.portfolioid == d.id; });
                var data_portfolio_date_arr = d3.nest().key(function(d){ return d.date; }).entries(data_portfolio);
                data_portfolio_date_arr.forEach(function(g){
                    g.values
                        .forEach(function(___d, j, array){
                            ___d._portfolio_position = (1/(array.length+1)) * (j+1);
                            ___d._portfolio_position_index = j;
                            options.pointStep = options.pointStep > 1/(array.length+1) ? 1/(array.length+1) : options.pointStep;
                        });
                });
            });
            dictionaries.project.forEach(function(d){
                var data_project = data.nodes.filter(function(_d){ return _d.projectid == d.id; });
                var data_project_date_arr = d3.nest().key(function(d){ return d.date; }).entries(data_project);
                data_project_date_arr.forEach(function(g){
                    g.values
                        .forEach(function(___d, j, array){
                            ___d._project_position = (1/(array.length+1)) * (j+1);
                            ___d._project_position_index = j;
                            options.pointStep = options.pointStep > 1/(array.length+1) ? 1/(array.length+1) : options.pointStep;
                        });
                });
            });
            dictionaries.status.forEach(function(d){
                var data_status = data.nodes.filter(function(_d){ return _d.statusid == d.id; });
                var data_status_date_arr = d3.nest().key(function(d){ return d.date; }).entries(data_status);
                data_status_date_arr.forEach(function(g){
                    g.values
                        .forEach(function(___d, j, array){
                            ___d._status_position = (1/(array.length+1)) * (j+1);
                            ___d._status_position_index = j;
                            options.pointStep = options.pointStep > 1/(array.length+1) ? 1/(array.length+1) : options.pointStep;
                        });
                });
            });
            dictionaries.leader.forEach(function(d){
                var data_leader = data.nodes.filter(function(_d){ return _d.leaderid == d.id; });
                var data_leader_date_arr = d3.nest().key(function(d){ return d.date; }).entries(data_leader);
                data_leader_date_arr.forEach(function(g){
                    g.values
                        .forEach(function(___d, j, array){
                            ___d._leader_position = (1/(array.length+1)) * (j+1);
                            ___d._leader_position_index = j;
                            options.pointStep = options.pointStep > 1/(array.length+1) ? 1/(array.length+1) : options.pointStep;
                        });
                });
            });
        };
        ktChart.prototype.data_extend_for_y_scalable_filtered = function() {
            var self = this,
                options = self.options,
                data = self.options.data,
                dictionaries = data.dictionaries;

            dictionaries.portfolio_filtered = dictionaries.portfolio.filter(function(_d){ return data.filtered.filter(function(_f){ return _f.portfolioid == _d.id; }).length > 0; });
            dictionaries.project_filtered = dictionaries.project.filter(function(_d){ return data.filtered.filter(function(_f){ return _f.projectid == _d.id; }).length > 0; });
            dictionaries.status_filtered = dictionaries.status.filter(function(_d){ return data.filtered.filter(function(_f){ return _f.statusid == _d.id; }).length > 0; });
            dictionaries.leader_filtered = dictionaries.leader.filter(function(_d){ return data.filtered.filter(function(_f){ return _f.leaderid == _d.id; }).length > 0; });
            dictionaries.level_filtered = dictionaries.level.filter(function(_d){ return data.filtered.filter(function(_f){ return _f.levelid == _d.id; }).length > 0; });

            data.filtered.forEach(function(d) {
                d._portfolioindex_filtered = dictionaries.portfolio_filtered.findIndex(function(_d){ return _d.id == d.portfolioid});
                d._projectindex_filtered = dictionaries.project_filtered.findIndex(function(_d){ return _d.id == d.projectid});
                d._statusindex_filtered = dictionaries.status_filtered.findIndex(function(_d){ return _d.id == d.statusid});
                d._leaderindex_filtered = dictionaries.leader_filtered.findIndex(function(_d){ return _d.id == d.leaderid});
                d._levelindex_filtered = dictionaries.level_filtered.findIndex(function(_d){ return _d.id == d.levelid});
            });

            options.maxLevel_filtered = d3.max(data.filtered, function(d) { return d._levelindex_filtered; }) + 1;
            options.maxPortfolio_filtered = d3.max(data.filtered, function(d) { return d._portfolioindex_filtered; }) + 1;
            options.maxProject_filtered = d3.max(data.filtered, function(d) { return d._projectindex_filtered; }) + 1;
            options.maxStatus_filtered = d3.max(data.filtered, function(d) { return d._statusindex_filtered; }) + 1;
            options.maxLeader_filtered = d3.max(data.filtered, function(d) { return d._leaderindex_filtered; }) + 1;
        };
        ktChart.prototype.data_extend_for_y_scalable_filtered_mini = function() {
            var self = this,
                data = self.options.data;

            data.filtered.forEach(function(d) {
                var _d_mini = data.mini.filter(function(_d){ return _d.pointid == d.pointid; });
                if (_d_mini.length > 0){
                    _d_mini[0]._portfolioindex_filtered = d._portfolioindex_filtered;
                    _d_mini[0]._projectindex_filtered = d._projectindex_filtered;
                    _d_mini[0]._statusindex_filtered = d._statusindex_filtered;
                    _d_mini[0]._leaderindex_filtered = d._leaderindex_filtered;
                    _d_mini[0]._levelindex_filtered = d._levelindex_filtered;
                }
            });
        };
        ktChart.prototype.data_extend_mini = function(){
            var self = this,
                options = self.options,
                functions = self.functions,
                data = self.options.data;

            data.mini = [];
            data.nodes.forEach(function(d) {
                data.mini.push($.extend(true, {}, d));
            });
        };

        ktChart.prototype.set_dimentions = function(){
            var self = this;
            var options = self.options,
                dimentions = self.dimentions,
                dom = self.options.ktdom.dom;

            dimentions.width = dom.panel_graph.width();
            dimentions.height = dom.panel_graph.height();
            dimentions.chartwidth = dimentions.width - options.margin.left - options.margin.right;
            dimentions.chartheight = dimentions.height - options.margin.top - options.margin.bottom;
        };

        ktChart.prototype.graph_build = function(){
            var self = this;
            self.graph_init_dom();
            self.graph_set_size();
            self.graph_calculate();
            self.graph_render_xaxis();
            self.graph_render_yaxis();
            self.graph_show_nodes(0);
        };
        ktChart.prototype.graph_init_dom = function(){
            var self = this;
            var data = self.options.data,
                objects = self.objects,
                functions = self.functions,
                ktdom = self.options.ktdom;

            objects.svg = d3.select('.' + ktdom.class.panel_graph).append("svg").attr("transform", "translate(0,0)");
            objects.main = objects.svg.append('g').attr('class', 'main');

            objects.xaxis_top = objects.main.append("g").attr("class", "axis axis--x-top");
            objects.xaxis = objects.main.append("g").attr("class", "axis axis--x");
            objects.yaxis = objects.main.append("g").attr("class", "axis axis--y");
            objects.yaxis
                .selectAll("text").attr("x", 0).attr("y", 20);
            objects.grid = objects.main.append("g").attr("class", "grid");

            objects.links = objects.main.append('g').attr('class', 'links');
            objects.nodes = objects.main.append('g').attr('class', 'nodes');
            objects.defs = objects.main.append("svg:defs");

            objects.def = objects.defs.selectAll("marker").data(data.links)
            objects.def
                .enter().append("svg:marker")
                .attr("id", function(d) { return d.source.pointid + '-' + d.target.pointid; })
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", 0)
                .attr("markerWidth", 8)
                .attr("markerHeight", 8)
                .attr("orient", "auto")
                .append("svg:path")
                .attr("d", "M0,-5L10,0L0,5")
                .style("fill", function(d){ return functions.color(d.source); });
            objects.def = objects.defs.selectAll("marker");

            objects.node = objects.nodes.selectAll("g")
                .data(data.nodes)
                .enter().append("g");

            objects.node.append("circle")
                .attr("id", function(d) { return d.pointid; })
                .attr("class", function(d) { return "circle-" + d.pointid; })
                .attr("r", function(d) { return d.radius; })
                .style("fill", function(d) { return functions.color(d); })
                .style("stroke", "#fff")

            objects.node.append("path")
                .style("pointer-events", "all")
                .on("click", function(d, i) {
                    if (d)
                        if (d.data._visible && d.data._visible_legend)
                            if (d3.event.ctrlKey) {
                                self.node_select(d.data);
                            } else {
                                self.node_open(d.data);
                            }
                })
                .on("contextmenu", function(d, i){
                    d3.event.preventDefault();
                    if (d)
                        if (d.data._visible && d.data._visible_legend)
                            self.node_select(d.data);
                })
                .on("mouseover", function(d, i) {
                    if (d)
                        if (d.data._visible && d.data._visible_legend)
                            self.node_mouseover(d.data);
                })
                .on("mouseout", function(d, i) {
                    if (d)
                        if (d.data._visible && d.data._visible_legend)
                            self.node_mouseout(d.data);
                });

            objects.link = objects.links.selectAll(".link").data(data.links);
            objects.link
                .enter().append("path")
                .attr("class", "link")
                .attr("marker-end", function(d) { return "url(#" + d.source.pointid + '-' + d.target.pointid + ")"; })
                .style('stroke', function(d){ return functions.color(d.source); })
                .style('fill', 'none');
            objects.link = objects.links.selectAll(".link");

            objects.today = objects.main.append("line").attr("class", "today");
        };
        ktChart.prototype.graph_set_size = function(){
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects;

            objects.svg.attr("width", dimentions.width).attr("height", dimentions.height);
            objects.main.attr("width", dimentions.width).attr("height", dimentions.chartheight).attr('transform', 'translate(0,' + options.margin.top + ')');
            objects.x = d3.scaleTime().range([options.margin.left * 2, dimentions.chartwidth]);
            objects.y = d3.scaleLinear().range([dimentions.chartheight, 0]);
        };
        ktChart.prototype.graph_calculate = function(){
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects,
                functions = self.functions;

            functions.yInit[options.yCurrent](objects);

            if (objects.selection) {
                objects.x.domain(objects.selection);
            } else {
                objects.x.domain(d3.extent(data.nodes, function(d) { return d.date; }));
            }
            objects.y.domain([options.maxY, 0]);

            data.nodes.forEach(function(d){
                d.x = objects.x(d.date);
                if (d[options.yfieldPosition] % 2 == 0) {
                    d.y = objects.y(d[options.yfield] + .5 + d[options.yfieldPosition]/2 * options.pointStep);
                } else {
                    d.y = objects.y(d[options.yfield] + .5 + (-d[options.yfieldPosition]/2 - 1/2) * options.pointStep);
                }
            });
            objects.voronoi = d3.voronoi()
                .extent([[0, 0], [dimentions.width, dimentions.chartheight]])
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; });
        }
        ktChart.prototype.graph_render_xaxis = function(){
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects,
                functions = self.functions;

            objects.xaxis
                //.transition().duration(options.durationCount)
                .call(d3.axisBottom(objects.x))
                .attr("transform", "translate(0," + dimentions.chartheight + ")");

            objects.xaxis_top
                //.transition().duration(options.durationCount)
                .call(d3.axisBottom(objects.x))
                .attr("transform", "translate(0,-" + (options.margin.top-1) + ")");

            objects.today
                //.transition().duration(options.durationCount)
                .attr("x1", objects.x(options.today)).attr("y1", 0)
                .attr("x2", objects.x(options.today)).attr("y2", dimentions.chartheight);
        };
        ktChart.prototype.graph_render_yaxis = function(){
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects,
                functions = self.functions;

            if (options.maxY <= options.yMaxCaptionCount) {
                objects.yaxis
                    //.transition().duration(options.durationCount)
                    .call(d3.axisRight(objects.y).ticks(options.maxY))
                    .selectAll("text")
                    .text(function(d){
                        var caption = "";
                        if (data.dictionaries[options.yTickData][d]) {
                            if (data.dictionaries[options.yTickData][d].name) {
                                caption = data.dictionaries[options.yTickData][d].name.toString();
                            }
                        }
                        return caption.length > options.yCaptionLength ? caption.substring(0, options.yCaptionLength) + "..." : caption;
                    })
                    .attr("transform", "translate(" + options.margin.left + ",0)").attr("x", -8).attr("y", 20);

                objects.yaxis.selectAll(".tick")
                    .filter(function(d){ return d === options.maxY; })
                    .remove();

                objects.grid
                    //.transition().duration(options.durationCount)
                    .call(make_y_gridlines().tickSize(-dimentions.width))
                    .attr("transform", "translate(0,0)");
            } else {
                objects.yaxis.selectAll(".tick").remove();
                objects.grid.selectAll(".tick").remove();
            }

            function make_y_gridlines() {
                return d3.axisLeft(objects.y).ticks(options.maxY);
            };
        };
        ktChart.prototype.graph_show_nodes = function(durationCount){
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects,
                functions = self.functions;

            /*no transition*/
            objects.node.selectAll("circle")
                .style("fill", function(d) { return d._selected ? "#ff4800" : functions.color(d); });
            objects.defs.selectAll("marker").select("path")
                .style("fill", function(d){ return d._selected ? '#ff4800' : functions.color(d.source); });
            objects.link
                .style('stroke', function(d){ return d._selected ? "#ff4800" : functions.color(d.source); });

            /*transition*/
            objects.node.selectAll("circle")
                .transition().duration(durationCount)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr('r',function(d){ return d.pointid == data.connected_n.pointid ? d.radius * 2 : d.radius; })
                .style("opacity", function(d){ return d._visible ? (d._visible_legend ?  options.opacity.in : options.opacity.out) : options.opacity.out; });

            objects.link
                .transition().duration(durationCount)
                .style("opacity", function(d){ return d._visible ? (d._visible_legend ?  options.opacity.link : options.opacity.out) : options.opacity.out; })
                .attr("d", function(d){
                    var dx = d.target.x - d.source.x,
                        dy = d.target.y - d.source.y,
                        dr = Math.sqrt(dx * dx + dy * dy)*3;
                    return "M" +
                        d.source.x + "," +
                        d.source.y + "A" +
                        dr + "," + dr + " 0 0,1 " +
                        d.target.x + "," +
                        d.target.y;
                })

            objects.nodes.selectAll("path")
                .data(objects.voronoi(data.nodes).polygons())
                .transition().duration(durationCount)
                .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });
        };
        ktChart.prototype.graph_resize = function(){
            var self = this;
            self.graph_set_size();
            self.graph_calculate();
            self.graph_render_xaxis();
            self.graph_render_yaxis();
            self.graph_show_nodes(0);
        };

        ktChart.prototype.brush_build = function(){
            var self = this;
            self.brush_init_dom();
            self.brush_set_size();
            self.brush_calculate();
            self.brush_render_yaxis();
            self.brush_show_nodes(0);
        };
        ktChart.prototype.brush_init_dom = function(){
            var self = this;
            var data = self.options.data,
                objects = self.objects;

            objects.mini = objects.svg.append('g').attr('class','mini');

            objects.mini.append("rect")
                .attr("class", "rectband")
                .style("opacity", .6)
                .style("stroke", "black")
                .style("cursor", "move");

            objects.mgrid = objects.mini.append("g").attr("class", "grid");

            objects.brusharea = objects.mini.append("g").attr("class", "brush");

            objects.mnodes = objects.mini.append("g")
                .attr("class", "mnodes");
            objects.mnode = objects.mnodes.selectAll("g")
                .data(data.mini)
                .enter().append("g");
            objects.mnode.append("circle")
                .attr("id", function(d) {
                    return d.pointid;
                })
                .attr("class", function(d) { return "circle-" + d.pointid; })
                .attr("r", 1)
                .style("fill", function(d) { return '#fff'; });

            objects.mtoday = objects.mini.append("line").attr("class", "mtoday");
        };
        ktChart.prototype.brush_set_size = function(){
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects;

            objects.mnodes.attr("width", dimentions.width).attr("height", options.miniHeight);
            objects.mini.attr("width", dimentions.width).attr("height", options.miniHeight).attr('transform', 'translate(0,' + (dimentions.height - options.miniHeight) + ')');
            objects.mini.select("rect").attr('width', dimentions.width).attr("height", options.miniHeight);

            objects.brush = d3.brushX().extent([[options.margin.left * 2, 0], [dimentions.chartwidth, options.miniHeight]]).on("end", brushended);
            objects.mini.select(".brush").call(objects.brush);

            objects.mx = d3.scaleTime().range([options.margin.left * 2, dimentions.chartwidth]);
            objects.my = d3.scaleLinear().range([self.options.miniHeight - 20, 20]);

            function brushended(){
                if (!d3.event.sourceEvent) return; // Only transition after input.
                // check empty selections.
                if (!d3.event.selection) {
                    objects.selection = null;
                    objects.x.domain(d3.extent(data.nodes, function(d) { return d.date; }));
                } else {
                    var d0 = d3.event.selection.map(objects.mx.invert),
                        d1 = d0.map(d3.timeDay.round);

                    // If empty when rounded, use floor & ceil instead.
                    if (d1[0] >= d1[1]) {
                        d1[0] = d3.timeDay.floor(d0[0]);
                        d1[1] = d3.timeDay.offset(d1[0]);
                    }

                    objects.selection = d1;
                    objects.x.domain(objects.selection);
                    objects.brusharea.transition().duration(options.durationCount).call(objects.brush.move, objects.selection.map(objects.mx));
                }
                self.graph_calculate();
                self.graph_render_xaxis();
                self.graph_show_nodes(options.durationCount);
            }
        };
        ktChart.prototype.brush_calculate = function(){
            var self = this;
            var data = self.options.data,
                options = self.options,
                objects = self.objects;

            objects.mx.domain(d3.extent(data.mini, function(d) { return d.date; }));
            objects.my.domain([options.maxY, 0]);

            data.mini.forEach(function(d){
                d.x = objects.mx(d.date);
                if (d[options.yfieldPosition] % 2 == 0) {
                    d.y = objects.my(d[options.yfield] + .5 + d[options.yfieldPosition]/2 * options.pointStep);
                } else {
                    d.y = objects.my(d[options.yfield] + .5 + (-d[options.yfieldPosition]/2 - 1/2) * options.pointStep);
                }
            });
        };
        ktChart.prototype.brush_render_yaxis = function(){
            var self = this;
            var options = self.options,
                dimentions = self.dimentions,
                objects = self.objects;

            if (options.maxY <= options.yMaxCaptionCount) {
                objects.mgrid.call(make_y_gridlines().tickSize(-dimentions.width)).attr("transform", "translate(0,0)");
                function make_y_gridlines() {
                    return d3.axisLeft(objects.my).ticks(options.maxY);
                };
            } else {
                objects.mgrid.selectAll(".tick").remove();
            }
            objects.mtoday
                //.transition().duration(options.durationCount)
                .attr("x1", objects.mx(options.today)).attr("y1", 0)
                .attr("x2", objects.mx(options.today)).attr("y2", self.options.miniHeight);
        };
        ktChart.prototype.brush_update_selection = function(){
            var self = this;
            var objects = self.objects;
            if (objects.selection) {
                objects.brusharea
                    //.transition().duration(options.durationCount)
                    .call(objects.brush.move, objects.selection.map(objects.mx));
            }
        };
        ktChart.prototype.brush_clear_selection = function(){
            var self = this;
            var data = self.options.data,
                objects = self.objects;
            if (objects.selection) {
                objects.selection = null;
                objects.x.domain(d3.extent(data.nodes, function(d){ return d.date; }));
                objects.brusharea.call(objects.brush.move, null);
            }
        };
        ktChart.prototype.brush_show_nodes = function(durationCount) {
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects,
                functions = self.functions;

            data.mini.map(function(_m){
                _m.visible = false;
                var _arr = data.nodes.filter(function(_d){ return _d.pointid == _m.pointid});
                if (_arr.length > 0)
                    _m._visible = _arr[0]._visible;
            })

            /*no transition*/
            objects.mnode.selectAll("circle")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            /*transition*/
            objects.mnode.selectAll("circle")
                .transition().duration(durationCount)
                .style("opacity", function(d){ return d._visible ? (d._visible_legend ?  options.opacity.in : options.opacity.out) : options.opacity.out; });
        };
        ktChart.prototype.brush_resize = function(){
            var self = this;
            self.brush_set_size();
            self.brush_calculate();
            self.brush_render_yaxis();
            self.brush_update_selection();
            self.brush_show_nodes(0);
        };

        ktChart.prototype.node_mouseover = function(_d){
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects,
                functions = self.functions;

            d3.select('.circle-' + _d.pointid)
                .attr('r',function(d){
                    if (d._visible) {
                        $('circle#' + d.pointid).tooltip({
                            html: true,
                            title:
                            '<div class="trow"><div class="name">Название</div><div class="value">' + d.code + '. ' + d.name + '</div></div>' +
                            '<div class="trow"><div class="name">Ответственный</div><div class="value">' + (d.leadername ? d.leadername : '') + '</div></div>' +
                            '<div class="trow"><div class="name">Дата</div><div class="value">' + (d._date?d._date:'') + '</div></div>' +
                            '<div class="trow"><div class="name">Статус</div><div class="value">' + d.statusname + '</div></div>' +
                            '<div class="trow"><div class="name">Проект</div><div class="value">' + d.projectname + '</div></div>' +
                            '<div class="trow"><div class="name">Портфель</div><div class="value">' + d.portfolioname + '</div></div>',
                            container: 'body',
                            placement: 'top',
                            trigger: 'manual',
                        }).tooltip('show');
                        return d.radius * 3;
                    }
                });
        };
        ktChart.prototype.node_mouseout = function(_d){
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects,
                functions = self.functions;

            d3.select('.circle-' + _d.pointid)
                .attr('r',function(d){
                    if (d._visible) {
                        $('circle#' + d.pointid).tooltip('hide');
                        return  d.pointid == data.connected_n.pointid ? d.radius * 2 : d.radius;
                    }
                });
        };
        ktChart.prototype.node_open = function(_d){
            var self = this;
            self.get_nodes_connected(_d);
            self.node_mouseout(_d);
            self.options.ktdom.info_show_tab('connected');
        };
        ktChart.prototype.node_select = function(_d){
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects,
                functions = self.functions;

            /*select node on viz*/
            d3.select('.circle-' + _d.pointid)
                .style('fill',function(d){
                    d._selected = !d._selected;
                    return d._selected ? '#ff4800' : functions.color(d);
                });

            /*update data._selected array*/
            if (_d._selected){
                data.selected.push(_d);
            } else {
                data.selected.forEach(function(d, i){
                    if (d.pointid == _d.pointid) {
                        data.selected.splice(i, 1);
                    }
                });
            }

            self.link_select(_d);
            self.options.ktdom.info_filtered_update(_d);
            self.options.ktdom.info_selected_update(_d);
            self.options.ktdom.info_connected_update(_d);
        };
        ktChart.prototype.link_select = function(_d){
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects,
                functions = self.functions;

            data.links.forEach(function(l){
                var _selected = false;
                if (l.source.pointid == _d.pointid){
                    data.selected.forEach(function(s, i){
                        if (l.target.pointid == s.pointid) {
                            l._selected = _d._selected;
                            _selected = l._selected;
                        }
                    });
                } else if (l.target.pointid == _d.pointid) {
                    data.selected.forEach(function(s, i){
                        if (l.source.pointid == s.pointid) {
                            l._selected = _d._selected;
                            _selected = l._selected;
                        }
                    });
                }
            });

            objects.link
                .style("stroke", function(d){
                    return d._selected ? '#ff4800' : functions.color(d.source);
                });
            objects.defs.selectAll("marker").select("path")
                .style("fill", function(d){
                    return d._selected ? '#ff4800' : functions.color(d.source);
                });
        };

        ktChart.prototype.get_nodes_filtered = function(){
            var self = this;
            var data = self.options.data;
            data.filtered = [];
            data.nodes.forEach(function(d){
                if (d._filtered) data.filtered.push(d);
            });
            data.filtered.sort(function(a,b){
                if (a.name > b.name) { return 1; }
                if (a.name < b.name) { return -1; }
                return 0;
            });
        };
        ktChart.prototype.get_nodes_connected = function(_d){
            var self = this;
            var data = self.options.data;
            data.connected = [_d];
            data.connected_n = _d;
            data.connected_s = [];
            data.connected_t = [];
            if (_d.pointid) {
                data.links.forEach(function(l){ l._connected = false; });
                data.nodes.forEach(function(d){
                    if (d.pointid == _d.pointid) {
                        d._connected = true;
                    } else {
                        var _connected = false;
                        data.links.forEach(function(l){
                            if (l.source.pointid == d.pointid && l.target.pointid == _d.pointid){
                                _connected = true;
                                d._connected = true;
                                l._connected = true;
                                data.connected.push(d);
                                data.connected_s.push(d);
                            } else if (l.target.pointid == d.pointid && l.source.pointid == _d.pointid) {
                                _connected = true;
                                d._connected = true;
                                l._connected = true;
                                data.connected.push(d);
                                data.connected_t.push(d);
                            }
                        });
                        if (!_connected) d._connected = false;
                    }
                });
            }
            data.connected.sort(function(a,b){
                if (a.name > b.name) { return 1; }
                if (a.name < b.name) { return -1; }
                return 0;
            });
            data.connected_s.sort(function(a,b){
                if (a.name > b.name) { return 1; }
                if (a.name < b.name) { return -1; }
                return 0;
            });
            data.connected_t.sort(function(a,b){
                if (a.name > b.name) { return 1; }
                if (a.name < b.name) { return -1; }
                return 0;
            });
        };
        ktChart.prototype.visible_nodes_filtered = function(){
            var self = this;
            var data = self.options.data;
            data.nodes.forEach(function(d){
                d._visible = d._filtered;
                d._viztype = 'filtered';
            });
            data.links.forEach(function(d){
                d._visible = d._filtered;
            });
        };
        ktChart.prototype.visible_nodes_selected = function(){
            var self = this;
            var data = self.options.data;
            data.nodes.forEach(function(d){
                d._visible = d._selected;
                d._viztype = 'selected';
            });
            data.links.forEach(function(d){
                d._visible = d._selected;
            });
        };
        ktChart.prototype.visible_nodes_connected = function(){
            var self = this;
            var data = self.options.data;
            data.nodes.forEach(function(d){
                d._visible = d._connected;
                d._viztype = 'connected';
            });
            data.links.forEach(function(d){
                d._visible = d._connected;
            });
        };
        ktChart.prototype.clear_nodes_selected = function(){
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects,
                functions = self.functions;

            /*update data*/
            data.selected = [];
            data.nodes.forEach(function(d){ d._selected = false; });
            data.links.forEach(function(d){ d._selected = false; });

            /*update colors on viz*/
            objects.node.select('circle').attr("fill", function(d){ return functions.color(d); });
            objects.link.style("stroke", function(d){ return functions.color(d.source); });
            objects.defs.selectAll("marker").select("path").attr("fill", function(d){ return functions.color(d.source); });

            /*update tabs*/
            self.options.ktdom.info_selected_update();
            self.options.ktdom.info_connected_update();
            self.options.ktdom.info_filtered_render();
            self.options.ktdom.info_show_tab('filtered');
        };
        ktChart.prototype.connect_nodes_selected = function(){
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects,
                functions = self.functions;

            data.selected.forEach(function(d, i, nodes){
                if (i > 0) {
                    var source = nodes[i-1];
                    var target = nodes[i];
                    var links = data.links.filter(function(d){ return d.source.pointid == source.pointid && d.target.pointid == target.pointid;  });
                    if (links.length == 0)
                        data.links.push({
                            source: source,
                            target: target,
                            _connected: false,
                            _filtered: source._filtered && target._filtered,
                            _selected: true,
                            _visible: true,
                            _visible_legend: true,
                        });
                }
            });

            /* add arrows */
            objects.def = objects.defs.selectAll("marker").data(data.links)
            objects.def
                .enter().append("svg:marker")
                .attr("id", function(d) { return d.source.pointid + '-' + d.target.pointid; })
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", 0)
                .attr("markerWidth", 8)
                .attr("markerHeight", 8)
                .attr("orient", "auto")
                .append("svg:path")
                .attr("d", "M0,-5L10,0L0,5")
                .style("fill", function(d){ return functions.color(d.source); });
            objects.def = objects.defs.selectAll("marker");

            /* add links */
            objects.link = objects.links.selectAll(".link").data(data.links)
            objects.link
                .enter().append("path")
                .attr("class", "link")
                .attr("marker-end", function(d) { return "url(#" + d.source.pointid + '-' + d.target.pointid + ")"; })
                .style('fill', 'none');
            objects.link = objects.links.selectAll(".link");

            self.graph_show_nodes(0);
        };
        ktChart.prototype.disconnect_nodes_selected = function(_d, sourcePointid, targetPointid){
            var self = this;
            var data = self.options.data,
                options = self.options,
                dimentions = self.dimentions,
                objects = self.objects,
                functions = self.functions;

            data.links.forEach(function(d, i, links){
                if (d.source.pointid == sourcePointid && d.target.pointid == targetPointid)
                    links.splice(i,1);
            });
            data.connected_s.forEach(function(d, i, snodes){
                if (d.pointid == sourcePointid) {
                    snodes.splice(i,1);
                    data.connected.splice(data.connected.indexOf(d), 1);
                    data.nodes.filter(function(f){ return f.index == d.index; })[0]._connected = false;
                }
            });
            data.connected_t.forEach(function(d, i, tnodes){
                if (d.pointid == targetPointid){
                    tnodes.splice(i,1);
                    data.connected.splice(data.connected.indexOf(d), 1);
                    data.nodes.filter(function(f){ return f.index == d.index; })[0]._connected = false;
                }
            });

            /* remove arrows */
            objects.def = objects.def.data(data.links);
            objects.def.exit().remove();

            /* remove links */
            objects.link = objects.link.data(data.links);
            objects.link.exit().remove();

            self.options.ktdom.info_connected_render(_d);
            self.graph_show_nodes(0);
        };

        ktChart.prototype.on_connect = function(){
            var self = this;
            var data = self.options.data,
                options = self.options;
            options.onConnect(data.selected, function(){
                self.connect_nodes_selected();
            });
        };
        ktChart.prototype.on_disconnect = function(_d, sourcePointid, targetPointid){
            var self = this;
            var options = self.options;
            options.onDisconnect(sourcePointid, targetPointid, function(){
                self.disconnect_nodes_selected(_d, sourcePointid, targetPointid);
            });
        };

        return ktChart;
    })();

    // [CHANGE] Инициализация плагина вынесена в файл ktChart.model.js
}).call(this);
