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
        //递归获取子节点并且设置子节点
        target.getChildNodes = function (data, parentNode, tbody,index) {
            index++;
            var child = parentNode["child"];
            if(child){
                var childs = child.split(",");
                $.each(childs, function (i, value) {//循环该节点所以子节点
                    var childNode = data[value];
                    if(childNode){
                        var tr = $('<tr style="display:none;" name="child" nodeId="'+childNode[options.id]+'"></tr>');
                        tr.addClass('treegrid-' + childNode[options.id]);
                        tr.addClass('treegrid-parent-' + parentNode[options.id]);
                        tr.addClass("treegrid-expanded");
                        for (var j = 0; j < options.columns.length; j++) {
                            var td = $('<td></td>');
                            if(j == 0){
                                for(var k = 0; k < index; k++){
                                    td.append('<span class="treegrid-indent"></span>');
                                }
                                if(childNode["child"]){
                                    td.append('<span class="treegrid-expander treegrid-expander-collapsed" onclick="treeGridClickFun(this,\''+childNode[options.id]+'\',true)"></span>');
                                }else{
                                    td.append('<span class="treegrid-indent"></span>');
                                }
                            }
                            td.append(childNode[options.columns[j].field]);
                            tr.append(td);
                        }
                        tbody.append(tr);
                        target.getChildNodes(data, childNode, tbody,index);
                    }
                });
                index++;
            }
        };
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
        target.createBody = function(data){
            //构造表体
            var tbody = $('<tbody></tbody>');
            target.find("tbody").remove();
            if(data.length == 0){
                return;
            }
            var rootNodeAndNowData = target.getRootNodes(data);
            var timestamp1 = new Date().getTime();
            $.each(rootNodeAndNowData[0], function (i, value) {//加载顶级节点
                var tr = $('<tr></tr>');
                tr.addClass('treegrid-' + value[options.id]);
                tr.addClass("treegrid-expanded");
                for (var j = 0; j < options.columns.length; j++) {
                    var td = $('<td></td>');
                    if(j == 0 && value["child"]){
                        td.append('<span class="treegrid-expander treegrid-expander-collapsed" onclick="treeGridClickFun(this,\''+value[options.id]+'\',true)"></span>');
                    }
                    td.append(value[options.columns[j].field]);
                    tr.append(td);
                };
                tbody.append(tr);
                target.getChildNodes(rootNodeAndNowData[1], value, tbody,0);//去递归加载子节点,使用新的数据结构
            });
            target.append(tbody);
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
