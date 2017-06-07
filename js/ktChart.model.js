/**
 * Created by mbaluev on 09.03.2017.
 */

// Warn if overriding existing method
if (Array.prototype.equals) console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function(array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

// Warn if overriding existing method
if (Array.prototype.findIndex) console.warn("Overriding existing Array.prototype.findIndex.");
// attach the .findIndex method to Array's prototype to call it on any array
Array.prototype.findIndex = function(condition) {
    var index = -1;
    this.some(function(el, i) {
        if (condition(el)) {
            index = i;
            return true;
        }
    });
    return index;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "findIndex", {enumerable: false});

(function () {
    var root = Asyst.Workspace.d3VizualizationData = {};
    $(function(){
        loadAllDataVizualization();
    });

    // Загрузка данных для визуализации
    function loadAllDataVizualization() {
        root.data = {};
        root.data.nodes = [];
        root.data.links = [];
        root.data.dictionaries = {};
        var filter = [
            { type: 'select', width: '200px', index: 1, multiple: true, dictionary: 'level', id: 'levelid', name: 'levelname', placeholder: 'Уровень' },
            { type: 'select', width: '200px', index: 2, multiple: true, dictionary: 'portfolio', id: 'portfolioid', name: 'portfolioname', placeholder: 'Портфель' },
            { type: 'select', width: '200px', index: 3, multiple: true, dictionary: 'project', id: 'projectid', name: 'projectname', placeholder: 'Проект' },
            { type: 'select', width: '200px', index: 4, multiple: true, dictionary: 'status', id: 'statusid', name: 'statusname', placeholder: 'Статус КТ' },
            { type: 'select', width: '300px', index: 5, multiple: true, dictionary: 'leader', id: 'leaderid', name: 'leadername', placeholder: 'Ответственный' },
            { type: 'input', width: '300px', placeholder: 'Начните вводить текст' },
        ];
        //рендерим дом
        root.ktdom = new Asyst.Workspace.Points.ktDom("wrapper", filter);
        //загружаем данные
        root.ktdom.loader_add("#wrapper", "loading", "Загрузка данных");
        /*Asyst.API.DataSet.load('ktChartData', { 'UserLang': 'RU' }, true, successLoad, null);*/
        //берем данные из файла ../data/pointData.js
        successLoad(null, pointData, levelData, portfolioData, activityData, phaseData, userData, treeData, repCalendar, repType, repReportData);
    }
    function successLoad(data, pointData, levelData, portfolioData, activityData, phaseData, userData, treeData, repCalendar, repType, repReportData) {
        var root, level, portfolio, activity, phase, user, targetIndex, sourceIndex, dictionaries;
        root = Asyst.Workspace.d3VizualizationData;
        dictionaries = root.data.dictionaries;

        root.ktdom.loader_remove("loading");
        root.ktdom.loader_add("#wrapper", "parsing", "Разбор данных");

        if (levelData)     { dictionaries.level = levelData; dictionaries.level.push({ id: null, name: "<Пусто>"}); }
        if (portfolioData) { dictionaries.portfolio = portfolioData; dictionaries.portfolio.push({ id: null, name: "<Пусто>"}); }
        if (activityData)  { dictionaries.project = activityData; dictionaries.project.push({ id: null, name: "<Пусто>"}); }
        if (phaseData)     { dictionaries.status = phaseData; dictionaries.status.push({ id: null, name: "<Пусто>"}); }
        if (userData)      { dictionaries.leader = userData; dictionaries.leader.push({ id: null, name: "<Пусто>"}); }
        if (repCalendar)   { dictionaries.repTypeCalendar = repCalendar; }
        if (repType)       { dictionaries.repType = repType; }
        if (pointData) {
            var nodes = Asyst.Workspace.d3VizualizationData.data.nodes;
            var links = Asyst.Workspace.d3VizualizationData.data.links;
            for (var i = 0; i < pointData.length; i++) {
                level = []; portfolio = []; activity = []; phase = []; user = []; report = [];
                if (pointData[i]['PointTypeId'] != null) {
                    level = dictionaries.level.filter(function(index){ return index.id == pointData[i]['PointTypeId'] });
                }
                if (pointData[i]['PortfolioId'] != null) {
                    portfolio = dictionaries.portfolio.filter(function(index){ return index.id == pointData[i]['PortfolioId'] });
                }
                if (pointData[i]['ActivityId'] != null) {
                    activity = dictionaries.project.filter(function(index){ return index.id == pointData[i]['ActivityId'] });
                }
                if (pointData[i]['ActivityPhaseId'] != null) {
                    phase = dictionaries.status.filter(function(index){ return index.id == pointData[i]['ActivityPhaseId'] });
                }
                if (pointData[i]['LeaderId'] != null) {
                    user = dictionaries.leader.filter(function(index){ return index.id == pointData[i]['LeaderId'] });
                }
                report = repReportData.filter(function(index){ return index.pointid == pointData[i]['Id'] });
                nodes.push({
                    pointid: pointData[i]['Id'],
                    code: pointData[i]['Code'] ? pointData[i]['Code'] : "",
                    name: pointData[i]['Name'] ? pointData[i]['Name'] : "",
                    date: pointData[i]['PlanDate'],
                    levelid: pointData[i]['PointTypeId'],
                    levelname: level.length > 0 ? level[0].name : "",
                    portfolioid: pointData[i]['PortfolioId'],
                    portfolioname: portfolio.length > 0 ? (portfolio[0].code + '. ' + portfolio[0].name) : "",
                    projectid: pointData[i]['ActivityId'],
                    projectname: activity.length > 0 ? (activity[0].code + '. ' + activity[0].name) : "",
                    statusid: pointData[i]['ActivityPhaseId'],
                    statusname: phase.length > 0 ? phase[0].name : "",
                    leaderid: pointData[i]['LeaderId'],
                    leadername: user.length > 0 ? user[0].name : "",
                    repReport: report.length > 0 ? report : ""
                });
            }
        }
        if (treeData) {
            for (var i = 0; i < treeData.length; i++) {
                sourceIndex = nodes.findIndex(function(d) { return d.pointid == treeData[i]['SourcePointId'] });
                targetIndex = nodes.findIndex(function(d) { return d.pointid == treeData[i]['TargetPointId'] });
                links.push({
                    source: sourceIndex,
                    target: targetIndex
                });
            }
        }

        var onConnect = function(nodes, callback_success){
            callback_success();
            /*
            savePointsTree(nodes, callback_success);
            */
        };
        var onDisconnect = function(sourcePointid, targetPointid, callback_success){
            callback_success();
            /*
            Asyst.API.DataSet.load('PointsTreeDeleter',
                { SourcePointId: sourcePointid, TargetPointId: targetPointid },
                true,
                function (data, messages) {
                    if (messages && messages.length && messages[0].ErrorMessage && messages[0].ErrorMessage.length) {
                        // При удалении произошла ошибка
                        Dialogs.Message(messages[0].ErrorMessage);
                    } else {
                        // Удаление прошло успешно
                        callback_success(); // удаляет связь sourcePointid->targetPointid
                        Dialogs.Message('##Связь удалена##');
                    }
                },
                function () {
                    Dialogs.Message('##При удалении связи произошла ошибка##'.locale());
                });
            */
        };
        var options = new Asyst.Workspace.Points.ktOptions(root, onConnect, onDisconnect);
        var chart = new Asyst.Workspace.Points.ktChart(options);

        root.ktoptions = options;
        root.ktchart = chart;
    }

    // Соединение выбранных точек связими иерархии (дерева) КТ
    function savePointsTree(nodes, callback_success) {
        var tree = nodes
            .map(function (el) { return el.pointid; });
        if (!tree.length) {
            return;
        }

        var treeXml = '<points>';
        for (var i = tree.length - 1; i > 0; i--) {
            var sourceId = tree[i - 1];
            var targetId = tree[i];
            treeXml += '<point><sourceid>' + sourceId + '</sourceid><targetid>' + targetId + '</targetid></point>';
        }
        treeXml += '</points>';

        Asyst.API.DataSet.load('PointsTreeSaver',
            { Tree: treeXml },
            true,
            function (data, messages) {
                if (messages && messages.length && messages[0].ErrorMessage && messages[0].ErrorMessage.length) {
                    // При сохранении произошла ошибка
                    Dialogs.Message(messages[0].ErrorMessage);
                } else {
                    // Сохранение прошло успешно
                    callback_success(); // рисует новые связи
                    Dialogs.Message('##Иерархия сохранена##'.locale());
                }
            },
            function () {
                Dialogs.Message('##При сохранении иерархии КТ произошла неизвестная ошибка##'.locale());
            });
    }
})();
