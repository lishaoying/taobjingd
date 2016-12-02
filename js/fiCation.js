/**
 * 公共配置
 **/
var publicAllocation = {
    url2: "http://192.168.0.88/pp/",
    userJD: "",     //userId,京东生命周期在页面刷新重新换掉
    userTB: "",     //userId,淘宝生命周期在页面刷新重新换掉
    imgValue: "",
    //Ajax二次封装
    initAjax: function(url, data, successfun){
        $.ajax({
            url: url,
            data: data,
            type: "post",
            dataType: "json",
            success:function(data){
                if(successfun && typeof(successfun) === "function"){
                    successfun(data);
                }
            }
        });
    },
    //解析地址栏
    parseURL: function(url){
        var a =  document.createElement('a');
        a.href = url;
        return {
            params: (function(){
                var ret = {},
                    seg = a.search.replace(/^\?/,'').split('&'),
                    len = seg.length, i = 0, s;
                for (;i<len;i++) {
                    if (!seg[i]) { continue; }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })()
        };
    },
    /**
     * Login加载
     **/
    PageLoading: function (options) {
        var defaults = {
            opacity: 1,
            backgroundColor: "#fff",
            borderColor: "#bbb",
            loadingTips: "正在登陆，请稍后...",
            TipsColor: "#666",
            delayTime: 1000,
            zindex: 999,
            sleep: 0
        };
        var options = $.extend(defaults, options);
        var _PageHeight = document.documentElement.clientHeight,
            _PageWidth = document.documentElement.clientWidth;
        var _LoadingHtml = '<div id="loadingPage" style="position:fixed;left:0;top:0;_position: absolute;width:100%;height:' + _PageHeight + 'px;background:' + options.backgroundColor + ';opacity:' + options.opacity + ';filter:alpha(opacity=' + options.opacity * 100 + ');z-index:' + options.zindex + ';"><div id="loadingTips" style="position: absolute; cursor1: wait; width: auto; height:100px; line-height:100px; padding-left:220px; background: ' + options.backgroundColor + ' url(images/loading.gif) no-repeat 5px center; color:' + options.TipsColor + ';font-size:20px;">' + options.loadingTips + '</div></div>';
        $("body").append(_LoadingHtml);
        var _LoadingTipsH = document.getElementById("loadingTips").clientHeight,
            _LoadingTipsW = document.getElementById("loadingTips").clientWidth;
        var _LoadingTop = _PageHeight > _LoadingTipsH ? _PageHeight / 2 - _LoadingTipsH * 2 : 0,
            _LoadingLeft = _PageWidth > _LoadingTipsW ? _PageWidth / 2 - _LoadingTipsW / 2 : 0;
        $("#loadingTips").css({
            "left": _LoadingLeft + "px",
            "top": _LoadingTop + "px"
        });
        var loadingMask = $('#loadingPage');
        setTimeout(function () {
            loadingMask.animate({
                "opacity": 0
            }, options.delayTime, function () {
                $(this).hide();
            })
        }, options.sleep);
    }
};

/**
 * 验证
 */
(function ($) {
    $.fn.checkForm = function (options) {
        var objThat = this, iSok = false;
        objThat.TF = true;

        var defaults = {
            //验证规则
            tips_success: '',
            tips_required: '不能为空',
            tips_four: '验证码有误',
            //验证正则
            reg_paw1: /^[a-zA-Z]\w{5,30}$/,
            four: /[a-zA-Z0-9]{4}/,
            form: options
        };

        if(options){ $.extend(defaults, options); }

        $(":text,:password").each(function(){
            $(this).focus(function(){
                var _focus = $(this).attr("data-focus");
                var _name = $(this).attr("name");
                getMsg($(this), _name, _focus);
            });
        });

        $(":text, :password").each(function () {
            $(this).blur(function () {
                $(this).attr("value",$(this).val());
                var _validate = $(this).attr("data-check");
                if (_validate) {
                    var arr = _validate.split('||');
                    for (var i = 0; i < arr.length; i++) {
                        if (!check($(this), arr[i], $(this).val())){ return false; } else{ continue; }
                    }
                }
            })
        });

        function _focusAll(id,tf,state) {
            $(":text,:password").each(function(){
                this.disabled = state;
                $(this).focus(function(){
                    var _focus = $(this).attr("data-focus");
                    var _name = $(this).attr("name");
                    getMsg($(this), _name, _focus);
                    if(!state){
                        n2.SubmitSuccess(id,tf);
                    }
                });
            });
        }

        function _focus(_obj) {
           $(_obj).focus(function() {
               var _focus = $(this).attr("data-focus");
               var _name = $(this).attr("name");
               getMsg($(this), _name, _focus);
           });
        }

        function _blur(_obj) {
            $(_obj).blur(function() {
                $(this).attr("value", $(this).val());
                publicAllocation.imgValue = $(this).val();
                var _validate = $(this).attr("data-check");
                if (_validate) {
                    var arr = _validate.split('||');
                    for (var i = 0; i < arr.length; i++) {
                        if (!check($(this), arr[i], $(this).val())){ return false; } else{ continue; }
                    }
                }
            });
        }

        function _onButton() {
            iSok = true;
            $(":text,:password").each(function () {
                var _validate = $(this).attr("data-check");
                if (_validate) {
                    var arr = _validate.split('||');
                    for (var i = 0; i < arr.length; i++) {
                        if (!check($(this), arr[i], $(this).val())) {
                            iSok = false;
                            return;
                        }
                    }
                }
            });
        }

        if (objThat.is("form")) {
            objThat.submit(function (e) {
                _onButton();
                if(iSok === true) {
                    e.preventDefault();
                    _focusAll('sub',true,true);
                    n2.SubmitSuccess('sub',true);
                    //京东表单
                    if(defaults.form == "#form2") {
                        publicAllocation.initAjax(publicAllocation.url2 + "loginJd", {"userId": publicAllocation.userJD, "authcode":$("input[name='yzm']").val(), "loginname":$("input[name='user']").val(), "loginpwd":$("input[name='pas']").val()}, function(data){
                            if(data.code == 0){
                                n2.ShowHide(".headForm",".information",n1.getJdInfoJd());
                                publicAllocation.PageLoading({ sleep: 800000000000 });
                            }else if(data.code == -4){
                                //手机验证码
                                $(".headForm").hide();
                                $("body").append('<div class="popup"> <a class="closeA" href="javascript:;" style="font-size: 22px; right: 11px; color: #aaa; font-weight: bold; cursor: pointer; text-decoration: initial; margin-left: 280px;">x</a> <div id="errorM2" style="margin-left: 90px;"> <i></i> <p id="errMessage2" style="display: inline; float: left;"></p> </div><input type="button" class="pick" value="重新获取验证码："><form action="" method="post" id="form4"> <input style="width: 150px;" type="text" name="mobileYzm" id="mobileYzm" data-focus="验证码不能为空" data-check="required" value=""> <span class="initText err">请输入验证码</span> <input type="submit" value="提交" class="login" id="sub2"> </form> </div> <div class="reveal-modal-bg"></div>');
                                n2.popup(function(){
                                    $(".pick").bind("click", function() {
                                        var ts = this;
                                        publicAllocation.initAjax(publicAllocation.url2 + "refreshMobileCode", {"userId": publicAllocation.userJD}, function(data) {
                                            if(data.code == 0){
                                                //手机验证码倒计时
                                                var count = 120;
                                                var Countdown = function(obj){
                                                    var timer = setInterval(function(){
                                                        if(count == 0){
                                                            obj.removeAttribute("disabled");
                                                            obj.value = "重新获取验证码";
                                                            count = 120;
                                                            clearInterval(timer);
                                                        }else{
                                                            obj.setAttribute("disabled",true);
                                                            obj.value = "" + count + "秒";
                                                            count--;
                                                        }
                                                    },1000);
                                                }(ts);
                                            }else{
                                                $("#errorM i").addClass("icon").text("-");
                                                $("#errMessage").text(data.message);
                                            }
                                        });
                                    });
                                    $(".closeA").bind("click",function(){
                                        window.location.reload();
                                    });
                                });
                                _focus("#mobileYzm");
                                _blur("#mobileYzm");
                                $(".login").bind("click",function(e) {
                                    e.preventDefault();
                                    _onButton();
                                    if (iSok === true) {
                                        _focusAll('sub2',true,true);
                                        n2.SubmitSuccess('sub2',true);
                                        publicAllocation.initAjax(publicAllocation.url2 + "postMobileCode", {"userId": publicAllocation.userJD}, function(data) {
                                            if(data.code == 0){
                                                n1.getJdInfoJd();
                                                publicAllocation.PageLoading({ sleep: 800000000000 });
                                            }else {
                                                $("#errorM2 i").addClass("icon").text("-");
                                                $("#errMessage2").text("验证码错误或消息通道忙!");
                                                _focusAll('sub2',false,false);
                                            }
                                        });
                                    }
                                });
                            }else{
                                $("#errorM i").addClass("icon").text("-");
                                $("#errMessage").text(data.message);
                                n1.yzm(function(userVal){
                                    publicAllocation.userJD = userVal;
                                });
                                _focusAll('sub',false,false);
                            }
                        });
                    }
                    //淘宝表单
                    if(defaults.form == "#form3") {
                        var loginUser = $("input[name='user']").val();
                        publicAllocation.initAjax(publicAllocation.url2 + "tbLogin", {"userId": publicAllocation.userTB, "authcode": publicAllocation.imgValue, "loginname": loginUser, "loginpwd": $("input[name='pas']").val()}, function(data) {
                            publicAllocation.userTB = data.userId;
                            if(data.code == 0){
                                publicAllocation.PageLoading({ sleep: 800000000000 });
                                publicAllocation.initAjax(publicAllocation.url2 + "getTbToken", {"userId": publicAllocation.userTB}, function(data) {
                                    if(data.code == 0) {
                                        n2.ShowHide(".headForm",".information", publicAllocation.initAjax(publicAllocation.url2 + "getTbInfo", {"userId": publicAllocation.userTB, "token": data.data, "appName": publicAllocation.parseURL(window.location.href).params.appName, "type": "taobao", "source": "ios"}, function(information) {
                                                if(information.code == 0){
                                                    $(".information").html(information.data);
                                                    n2.LoadingEnd();
                                                }else{
                                                    alert(information.message);
                                                }
                                            })
                                        );
                                    }else{
                                        alert(data.message);
                                    }
                                });
                            }else if(data.code == 2) {
                                //图片验证码
                                n2.SubmitSuccess('sub',false);
                                $("#errorM i").addClass("icon").text("-");
                                $("#errMessage").text(data.message);
                                _focusAll('sub',false,false);
                                if(objThat.TF) {
                                    $(".pas").append('<div class="imgNode" style="margin-top: 20px;">验证码： <input style="margin-left: 5px;" type="text" name="imgYzm" id="imgYzm2" data-focus="验证码不能为空" data-check="required||four" maxlength="4"> <span class="initText err">请输入图片验证码</span> <img src="" id="imgYzm" style="vertical-align: middle; margin-left: 25%;"> <span style="cursor: pointer;" id="change">换一张</span> </div>');
                                    _focus("#imgYzm2");
                                    document.getElementById("imgYzm").src = "data:image/png;base64," + data.yzm;
                                    _blur("#imgYzm2");
                                }
                                $("#change").bind("click", function(){
                                    publicAllocation.initAjax(publicAllocation.url2 + "refreshVerifyCode", {"userId": publicAllocation.userTB}, function(data) {
                                        if(data.code == 0){
                                            document.getElementById("imgYzm").src = "data:image/png;base64," + data.yzm;
                                        }else{
                                            alert(data.message);
                                        }
                                    });
                                });
                                objThat.TF = false;
                                return objThat.TF;
                            }else if(data.code == 3) {
                                //手机验证码
                                $(".headForm").hide();
                                $("body").append('<div class="popup"> <a class="closeA" href="javascript:;" style="font-size: 22px; right: 11px; color: #aaa; font-weight: bold; cursor: pointer; text-decoration: initial; margin-left: 280px;">x</a> <div id="errorM2" style="margin-left: 90px;"> <i></i> <p id="errMessage2" style="display: inline; float: left;"></p> </div><input type="button" class="pick" value="重新获取验证码："><form action="" method="post" id="form4"> <input style="width: 150px;" type="text" name="mobileYzm" id="mobileYzm" data-focus="验证码不能为空" data-check="required" value=""> <span class="initText err">请输入验证码</span> <input type="submit" value="提交" class="login" id="sub2"> </form> </div> <div class="reveal-modal-bg"></div>');
                                n2.popup(function(){
                                    $(".pick").bind("click", function() {
                                        var ts = this;
                                        publicAllocation.initAjax(publicAllocation.url2 + "refreshMobileCode", {"userId": publicAllocation.userTB, "loginname": loginUser}, function(data) {
                                            if(data.code == 0){
                                                //手机验证码倒计时
                                                var count = 120;
                                                var Countdown = function(obj){
                                                    var timer = setInterval(function(){
                                                        if(count == 0){
                                                            obj.removeAttribute("disabled");
                                                            obj.value = "重新获取验证码";
                                                            count = 120;
                                                            clearInterval(timer);
                                                        }else{
                                                            obj.setAttribute("disabled",true);
                                                            obj.value = "" + count + "秒";
                                                            count--;
                                                        }
                                                    },1000);
                                                }(ts);
                                            }else{
                                                $("#errorM i").addClass("icon").text("-");
                                                $("#errMessage").text(data.message);
                                            }
                                        });
                                    });
                                    $(".closeA").bind("click",function(){
                                        window.location.reload();
                                    });
                                });
                                _focus("#mobileYzm");
                                _blur("#mobileYzm");
                                $(".login").bind("click",function(e) {
                                    e.preventDefault();
                                    _onButton();
                                    if (iSok === true) {
                                        _focusAll('sub2',true,true);
                                        n2.SubmitSuccess('sub2',true);
                                        publicAllocation.initAjax(publicAllocation.url2 + "postMobileCode", {"userId": publicAllocation.userTB, "loginname": loginUser, "checkCode": $("input[name='mobileYzm']").val()}, function(data) {
                                            if(data.code == 0){
                                                publicAllocation.initAjax(publicAllocation.url2 + "getTbToken", {"userId": publicAllocation.userTB}, function(json) {
                                                    var token = json.data;
                                                    publicAllocation.PageLoading({ sleep: 800000000000 });
                                                    if(data.code == 0){
                                                        n2.ShowHide(".popup",".information", publicAllocation.initAjax(publicAllocation.url2 + "getTbInfo", {"userId": publicAllocation.userTB, "token": token, "appName": publicAllocation.parseURL(window.location.href).params.appName, "type": "taobao", "source": "ios"}, function(information) {
                                                                if(information.code == 0) {
                                                                    $(".reveal-modal-bg").hide();
                                                                    $(".information").html(information.data);
                                                                    n2.LoadingEnd();
                                                                }else {
                                                                    alert(data.message);
                                                                }
                                                            })
                                                        );
                                                    }else {
                                                        alert(data.message);
                                                    }
                                                });
                                            }else {
                                                $("#errorM2 i").addClass("icon").text("-");
                                                $("#errMessage2").text("验证码错误或消息通道忙!");
                                                _focusAll('sub2',false,false);
                                            }
                                        });
                                    }
                                });
                            }else {
                                $("#errorM i").addClass("icon").text("-");
                                $("#errMessage").text(data.message);
                                _focusAll('sub',false,false);
                                if(n2.exist(".imgNode")) {
                                    publicAllocation.initAjax(publicAllocation.url2 + "refreshVerifyCode", {"userId": publicAllocation.userTB}, function(data) {
                                        if(data.code == 0 && $("#imgYzm").length > 0){
                                            document.getElementById("imgYzm").src = "data:image/png;base64," + data.yzm;
                                        }else {
                                            alert(data.message);
                                        }
                                    });
                                }else {
                                    return false;
                                }
                            }
                        });
                    }
                }else{
                    return iSok;
                }
            })
        }

        var check = function (obj, _match, _val) {
            switch (_match) {
                case 'required':
                    return $.trim(_val ) !== '' ? showMsg(obj, defaults.tips_success, true) : showMsg(obj, defaults.tips_required, false);
                case 'four':
                    return chk(_val, defaults.four) ? showMsg(obj, defaults.tips_success, true) : showMsg(obj, defaults.tips_four, false);
                default:
                    return true;
            }
        };

        var chk = function (str, reg) {
            return reg.test(str);
        };

        var getMsg = function(obj, showName, focus){
            $(obj).next(".err").remove();
            if (showName) {
                var _html = "<span class='err initText'> " + focus + " </span>";
            }
            $(obj).after(_html);
            return showName;
        };

        var showMsg = function (obj, msg, mark) {
            obj.css("border","1px solid red");
            $(obj).next(".err").remove();
            var _html = "<span class='err errorText'> " + msg + " </span>";
            if (mark) {
                _html = "<span class='err successText'> " + msg + " </span>";
                obj.css("border","1px solid #ccc");
            }
            $(obj).after(_html);
            return mark;
        };
    }
})(jQuery);

function yzmModule2(){
    //防止重复提交
    this.SubmitSuccess = function(id, state){
        document.getElementById(id).disabled = state;
    };
    //判断节点是否存在
    this.exist = function(NodeObj){
        if($(NodeObj).length >= 1){
            return true;
        }
        return false;
    };
    //显示隐藏
    this.ShowHide = function(hideClass,showClass,fn){
        $(hideClass).hide(0,function(){
            $(showClass).show(0,function(){
                fn;
            });
        });
    };
    this.LoadingEnd = function(){
        $('#loadingPage').animate({
            "opacity": 0
        }, 1000, function () {
            $(this).hide();
        })
    }
}

yzmModule2.prototype = {
    popup: function(callbackPick){
        var popup = $(".popup");
        setTimeout(function(){
            $(".reveal-modal-bg").fadeIn(function(){
                popup.fadeIn(function(){
                    setInterval(function(){
                        popup.animate({
                            "margin-top": screen.height / 2 - popup.height() * 2
                        })
                    },200)
                });
            });
        },0);
        callbackPick();
        //$("#form4").checkForm("#form4");
    }
};
var n2 = new yzmModule2();
//function RegXe(string){
//    if(string.indexOf("onClick") == -1) {
//        alert("不存在这个字符");
//    }else {
//        var RegTest = string.split("onClick=");
//        var aaa = RegTest[1].replace(/value="查看"/, "").replace(/loadInfo/, "");
//        console.log(aaa.substring(2, aaa.length-4));
//    }
//}
//RegXe('<input type="button" onClick="loadInfo(ffd7b938-23bb-432c-bb7e-516ba5f8ffd1)" value="查看">');




