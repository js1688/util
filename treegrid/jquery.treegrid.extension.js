function treeGridClickFun(ts,id,type){//true 将触发展开,false 不触发展开
    var trs = $(ts).parent().parent().nextAll('.treegrid-parent-'+id);
    for(var l = 0; l < trs.length; l++){
        var lcss = $(trs[l]).css('display');
        if(lcss == 'none' && type){
            $(trs[l]).css('display','');
        }else{
            $(trs[l]).css('display','none');
            var nodeId = $(trs[l]).attr('nodeId');
            var sanjiao = $(trs[l]).find('.treegrid-expander-expanded');
            if(sanjiao.length > 0){
                $(sanjiao[0]).removeClass('treegrid-expander-expanded',);
                $(sanjiao[0]).addClass('treegrid-expander-collapsed');
            }
            treeGridClickFun(ts,nodeId,false);
        }
    }
    if(type){
        $(ts).toggleClass('treegrid-expander-collapsed');
        $(ts).toggleClass('treegrid-expander-expanded');
    }
};
function treeGridCheckbox(ts,id) {//点击勾选框触发事件
    //递归找到所有子节点设置为选中
    var tschecked = $(ts).prop("checked");
    var tsindeterminate = $(ts).prop("indeterminate");
    function d(dtrs,dtschecked,tsindeterminate) {
        for(var childObj = 0; childObj < dtrs.length; childObj++){
            var obj = $(dtrs[childObj]);
            var input = obj.find("input[type='checkbox']");
            input.prop("checked",dtschecked);
            input.prop("indeterminate",tsindeterminate);
            var child = obj.attr("nodeId");
            d2(input,child,dtschecked);
        }
    }
    function d2(dts,did,d2tschecked,tsindeterminate) {
        var trs = $(dts).parent().parent().nextAll('.treegrid-parent-'+did);
        d(trs,d2tschecked,tsindeterminate);
    }
    d2(ts,id,tschecked,tsindeterminate);
    treeGridCheckbox_s(ts);//检查父节点
}

function treeGridCheckbox_s(ts) {
    //递归找父节点检查父节点所属的子节点是否为全部都勾选了,如果是则也设置勾选,如果为否则设置半勾选
    function t(ttrs,tid) {
        var input = $(ttrs).find("input[type='checkbox']");
        var g = input.prop("checked");
        var is = t3(ttrs,tid);
        if(is == true){
            input.prop("indeterminate", false);
            input.prop("checked",true);
        }else if(is == false){
            input.prop("indeterminate", false);
            input.prop("checked",g);
        }else{
            input.prop("indeterminate", true);
            input.prop("checked",true);
        }
        t2(input);
    }
    function t2(tts){
        var ttsObj = $(tts).parent().parent();
        var trs = ttsObj.prevAll('.treegrid-'+ttsObj.attr("pId"));
        if(trs.length == 0){
            return;
        }
        var pid = $(trs[0]).attr("nodeId");
        t(trs[0],pid);
    }
    function t3(ttrs,tid) {//true 全勾,false 全没有全勾 3 半选
        //获取这个节点的所以子节点,检查是否都被设置为了勾选
        var trs = $(ttrs).nextAll('.treegrid-parent-'+tid);
        var tre = 0;
        var fal = 0;
        var bx = 0;
        for(var i = 0; i < trs.length; i++){
            var obj = $(trs[i]).find("input[type='checkbox']");
            if(obj.prop("checked")){
                tre++;
            }else{
                fal++;
            }
            if(obj.prop("indeterminate")){
                bx++;
            }
        }
        if(tre == trs.length && bx == 0){//全选
            return true;
        }else if(fal == trs.length && bx ==0){//全没被选中
            return false;
        }else{//半选
            return 3;
        }
    }
    t2(ts);
}

(function ($) {
    "use strict";

    $.fn.treegridData = function (options, param) {
        //如果是调用方法
        if (typeof options == 'string') {
            return $.fn.treegridData.methods[options](this, param);
        }

        //如果是初始化组件
        options = $.extend({}, $.fn.treegridData.defaults, options || {});
        var target = $(this);
        //得到根节点,顺便更改一下存储结构
        target.getRootNodes = function (data) {
            var result = [];
            var nowData = {};
            $.each(data, function (index, value) {
                if (value[options.parentColumn] == 0) {
                    result.push(value);
                }
                nowData[value[options.id]] = value;
            });
            return [result,nowData];
        };
        target.setIsSelected = function(selected){//可以再初始化之后在初始化之后再设置是否出现勾选框
            options["selected"] = selected;
        };
        //递归获取子节点并且设置子节点
        target.getChildNodes = function (data, parentNode, tbody,index) {
            index++;
            var child = parentNode["child"];
            if(child){
                var childs = child.split(",");
                $.each(childs, function (i, value) {//循环该节点所以子节点
                    var childNode = data[value];
                    if(childNode){
                        var tr = $('<tr style="display:none;" name="child" nodeId="'+childNode[options.id]+'" pId="'+parentNode[options.id]+'"></tr>');
                        tr.addClass('treegrid-' + childNode[options.id]);
                        tr.addClass('treegrid-parent-' + parentNode[options.id]);
                        tr.addClass("treegrid-expanded");
                        for (var j = 0; j < options.columns.length; j++) {
                            var td = $('<td></td>');
                            var vl = childNode[options.columns[j].field];
                            if(j == 0){
                                for(var k = 0; k < index; k++){
                                    td.append('<span class="treegrid-indent"></span>');
                                }
                                if(childNode["child"]){
                                    td.append('<span class="treegrid-expander treegrid-expander-collapsed" onclick="treeGridClickFun(this,\''+childNode[options.id]+'\',true)"></span>');
                                }else{
                                    td.append('<span class="treegrid-indent"></span>');
                                }
                                if(options.selected){//如果开启了勾选,则生成单选框并赋予点击事件
                                    var isselected = childNode["isselected"];
                                    if(isselected){
                                        target.selectedIds.push(childNode[options.id]);
                                    }
                                    var ckx = $('<input type="checkbox" onclick="treeGridCheckbox(this,\''+childNode[options.id]+'\')">');
                                    td.append(ckx);
                                }
                            }
                            td.append(vl);
                            tr.append(td);
                        }
                        tbody.append(tr);
                        target.getChildNodes(data, childNode, tbody,index);
                    }
                });
                index++;
            }
        };
        target.setSelected = function(id){//设置某个id为选中
            var ts = target.find("tr[nodeId='"+id+"']").find("input[type='checkbox']");
            $(ts).prop("checked",true);
            treeGridCheckbox_s(ts);
        }
        target.openAll = function(){
            var childs = target.find('[name=child]');
            for(var i = 0; i < childs.length; i++){
                $(childs[i]).css("display","");
            }
        }
        target.closeAll = function(){
            var childs = target.find('[name=child]');
            for(var i = 0; i < childs.length; i++){
                $(childs[i]).css("display","none");
            }
        }
        target.getSelectedAll = function(){//获取所有勾选的
            var ids = [];
            var trs = target.find('tbody').find('tr');
            for(var i = 0; i< trs.length; i++){
                var obj = $(trs[i]);
                var input = obj.find("input[type='checkbox']");
                if(input.prop("checked")){
                    ids.push(obj.attr("nodeId"));
                }
            }
            return ids;
        }
        target.createBody = function(data){
            //构造表体
            var tbody = $('<tbody></tbody>');
            target.find("tbody").remove();
            if(data.length == 0){
                return;
            }
            var rootNodeAndNowData = target.getRootNodes(data);
            var timestamp1 = new Date().getTime();
            target.selectedIds = [];
            $.each(rootNodeAndNowData[0], function (i, value) {//加载顶级节点
                var tr = $('<tr nodeId="'+value[options.id]+'"></tr>');
                tr.addClass('treegrid-' + value[options.id]);
                tr.addClass("treegrid-expanded");
                for (var j = 0; j < options.columns.length; j++) {
                    var td = $('<td></td>');
                    var vl = value[options.columns[j].field];
                    if(j == 0 && value["child"]){
                        td.append('<span class="treegrid-expander treegrid-expander-collapsed" onclick="treeGridClickFun(this,\''+value[options.id]+'\',true)"></span>');
                    }
                    if(j == 0 && options.selected) {//如果开启了勾选,则生成单选框并赋予点击事件
                        var isselected = value["isselected"];
                        if(isselected){
                            target.selectedIds.push(value[options.id]);
                        }
                        var ckx = $('<input type="checkbox" onclick="treeGridCheckbox(this,\''+value[options.id]+'\')">');
                        td.append(ckx);
                    }
                    td.append(vl);
                    tr.append(td);
                };
                tbody.append(tr);
                target.getChildNodes(rootNodeAndNowData[1], value, tbody,0);//去递归加载子节点,使用新的数据结构
            });
            target.append(tbody);
            for(var i = 0; i< target.selectedIds.length; i++){
                target.setSelected(target.selectedIds[i]);
            }
            var timestamp2 = new Date().getTime();
            console.log("组装耗时:" + (timestamp2 - timestamp1));
            //target.treegrid();
            if (!options.expandAll) {
                target.treegrid('collapseAll');
            }
        };
        target.addClass('table');
        if (options.striped) {
            target.addClass('table-striped');
        }
        if (options.bordered) {
            target.addClass('table-bordered');
        }
        //构造表头
        var thr = $('<tr></tr>');
        $.each(options.columns, function (i, item) {
            var th = $('<th style="padding:10px;"></th>');
            th.text(item.title);
            thr.append(th);
        });
        var thead = $('<thead></thead>');
        thead.append(thr);
        target.append(thead);

        //构造表体
        if(options.data || options.data.length != 0){
            target.createBody(options.data);
        }else if(options.url){
            $.ajax({
                type: options.type,
                url: options.url,
                data: options.ajaxParams,
                dataType: "JSON",
                success: function (data, textStatus, jqXHR) {
                    target.createBody(options.data);
                }
            });
        }
        target.treegrid();
        return target;
    };

    $.fn.treegridData.methods = {
        getAllNodes: function (target, data) {
            return target.treegrid('getAllNodes');
        },
        //组件的其他方法也可以进行类似封装........
    };

    $.fn.treegridData.defaults = {
        id: 'id',
        parentColumn: 'pid',
        data: [],    //构造table的数据集合
        type: "GET", //请求数据的ajax类型
        url: null,   //请求数据的ajax的url
        ajaxParams: {}, //请求数据的ajax的data属性
        expandColumn: null,//在哪一列上面显示展开按钮
        expandAll: false,  //是否全部展开
        striped: false,   //是否各行渐变色
        bordered: false,  //是否显示边框
        columns: [],
        expanderExpandedClass: 'glyphicon glyphicon-chevron-down',//展开的按钮的图标
        expanderCollapsedClass: 'glyphicon glyphicon-chevron-right'//缩起的按钮的图标

    };
})(jQuery);