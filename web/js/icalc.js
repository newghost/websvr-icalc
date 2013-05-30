/*
Description: icalc
Author:      Kris Zhang
*/
$.fn.serializeObject = function() {
  return JSON.stringify(this.serializeJSON());
};

$.fn.serializeJSON = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

STATUS = {
    404: "操作失败"
  , 451: "请先登录"
  , 452: "用户不存在"
  , 453: "密码不正确"
  , 454: "用户已存在"
};

//Ajax configuration
$(document).ajaxError(function(e, xhr, settings) {
  //It's user aborted?
  if (!xhr.getAllResponseHeaders()) return;

  var msg = STATUS[xhr.status];
  msg && Msg.alert(msg);
  Nav.loading = false;
});

$(document).ajaxStart(function() {
  Nav.loading = true;
});

$(document).ajaxStop(function() {
  Nav.loading = false;
});

$.ajaxSetup({
    type: "post"
  , error: function(xhr, status) {
    console.log(arguments);
    //It's user aborted?
    if (!xhr.getAllResponseHeaders()) return;
    Nav.loading = false;
  }
});

var MSG = {
    title:    "提示消息"
  , confirm:  "确定"
  , cancel:   "取消"
};

var Utility = {
  //Sort a list of Objects by specific field
  sort: function(objArr, field) {
    var tmp;
    for (var i = 0, l = objArr.length; i < l; i++) {
      for (var j = i + 1; j < l; j++) {
        if (objArr[i][field] < objArr[j][field]) {
          tmp = objArr[j];
          objArr[j] = objArr[i];
          objArr[i] = tmp;
        }
      }
    }
    return objArr;
  }

  // get current date etc: 2012-08-09
  , getDate: function() {
    var d     = new Date()
      , month = d.getMonth() + 1
      , day   = d.getDate();

    month < 10 && (month  = '0' + month);
    day   < 10 && (day    = '0' + day);

    return "{0}-{1}-{2}".format(d.getFullYear(), month, day);
  }
};

var iCalc = {
  logout: function() {
    location.href = "#login";
    $.removeCookie("_wsid");
  } 
};

//Master Module
iCalc.Master = (function() {

  var $username = $("#username")
    , $password = $("#password")
    , $remember = $("#remember")
    , storage   = localStorage;

  var rememberReset = function() {
    if ($remember.is(":checked")) {
      storage["username"] = $username.val();
      storage["password"] = $password.val();
      storage["remember"] = true;
    } else {
      storage.removeItem("username");
      storage.removeItem("password");
      storage.removeItem("remember");
    }
  };

  var loginHandler = function() {
    rememberReset();

    $.ajax({
        url: "login.svr"
      , data: $("#loginfm").serializeObject()
      , success: function() {
        location.href = "#home";
      }
    });
  };

  var registHandler = function() {
    var registObj = $("#registfm").serializeJSON();
    $.ajax({
        url: "regist.svr"
      , data: JSON.stringify(registObj)
      , success: function() {
        $("#loginfm [name=email]").val(registObj.email);
        location.href = "#login";
      }
    });
  };
  
  var init = function() {
    $("#loginfm").validate({
      rules: {
          email:    {required: true, minlength: 3, maxlength: 32}
        , password: {required: true, minlength: 3, maxlength: 32}
      },
      submitHandler: loginHandler
    });

    $("#registfm").validate({
      rules: {
          email:      {required: true, minlength: 3, maxlength: 32}
        , password:   {required: true, minlength: 3, maxlength: 32}
        , repassword: {required: true, minlength: 3, maxlength: 32, equalTo: "#regist_password"}
      },
      submitHandler: registHandler
    });

    $("#btnLogin").click(function() {
      $("#loginmsg").hide();
      $("#loginfm").submit();
    });

    $("#btnRegist").click(function() {
      $("#registmsg").hide();
      $("#registfm").submit();
    });

    $("#btnNew").click(function() {
      var username = $username.val()
        , password = $password.val();

      username && $("#registfm [name=username]").val(username);
      password && $("#registfm [name=password]").val(password);
    });

    $("#btnClear").click(function() {
      $username.val("");
      $password.val("");
      $remember.removeAttr("checked");
      rememberReset();
    });

    if (storage["remember"]) {
      window.setTimeout(function() {
        $username.val(storage["username"]);
        $password.val(storage["password"]);
        $remember.attr("checked", "checked");
      }, 500);
    }

    //refresh go to login.
    location = "#login";
  };

  init();
})();

//Home Module
iCalc.Home = (function() {

  var fill = function(dataArr) {
    var $account_container = $("#account_container");

    //sort by date
    Utility.sort(dataArr, "date");

    dataArr.forEach(function(data) {
      var $account = $('<div class="account"></div>')
        , date  = data.date
        , rows  = data.list
        , note  = data.note
        , sum   = 0
        , type  = {}
        , sortedRows  = [];

      //catalogo all rows
      rows.forEach(function(row) {
        var number = parseInt(row.sum);
        sum += number;

        typeof type[row.type] == "undefined"
          && (type[row.type] = { sum: 0, rows:[] });

        var classify = type[row.type];
        classify.sum += number;
        classify.rows.push(row);
      });

      $account.append(
        '<h3><span>日期： {0}</span><b>总金额: {1}</b></h3><div class="message">备注: {2}</div>'
          .format(date, sum, note)
      );

      for (var name in type) {
        var $table    = $('<table class="data"></table>')
          , classify  = type[name];

        $table.datagrid({
          columns:[[
              {title: "类别: " + name, field: "name"}
            , {title: "金额: " + classify.sum, field: "sum"}
          ]]
        }).datagrid("loadData", {rows: classify.rows});

        Array.prototype.push.apply(sortedRows, classify.rows);

        $account.append($table);
      }

      //stored sorted rows for editing.
      data.list = sortedRows;

      $account.data("data", data);
      $account_container.append($account);
    });

    $("#account_container .account").selected();
  };

  var load = function() {
    $.ajax({
        url: "accounts.svr"
      , dataType: "json"
      , success: fill
    });
  };

  var bind = function() {
    $("#btnNewAsset").click(function() {
      iCalc.Edit.newer();
      location = "#edit";
    });

    $("#btnEditAsset").click(function() {
      if ($(".account.selected").size()) {
        iCalc.Edit.edit();
        location = "#edit";
      } else {
        Msg.alert("请先选择一个资产统计!");
      }
    });
  };

  var init = function() {
    load();
    bind();
  };

  return {
    init: init
  }
})();

//Edit property grid.
iCalc.Edit = (function() {

  var $editTable = $("#editTable")
    , $editTitle = $("#editTitle")
    , $editDate  = $("#editDate")
    , $editNote  = $("#editNote")
    , edit = {}
    , url  = "";

  var init = function(title) {
    $editTitle.html(title);
    $editTable.html('');
  };

  var bind = function() {
    //It's refresh on the edit page?
    location.hash == "#edit"
      && $editTable.html() == ""
      && (location = "#home");

    $("#btnDelAsset").click(function(e) {
      Msg.confirm("您确定要删除此帐？", function() {
        var $account = $(".account.selected");
        if ($account.size()) {
          console.log(edit.data);
          $.ajax({
              url: "account_del.svr"
            , data: JSON.stringify(edit.data)
            , success: function() {
              location = "#home";
            }
            , error: function() {
              Msg.alert("删除失败");
            }
          });
        } else {
          Msg.alert("请先选择一个资产统计!");
        }
      });
    });

    $("#btnSaveAsset").click(function(e) {
      var list = [];

      $("#editTable tbody tr").each(function() {
        var $row = $(this), item = {};
        $("input", $row).each(function() {
          var $input  = $(this)
            , name    = $input.attr("name")
            , value   = $input.val();

          name == "sum" && (value = Number(value) || 0);
          item[name] = value;
        });
        list.push(item);
      });

      var data =  {
          olddate: edit.data.date
        , date: $editDate.val()
        , note: $editNote.val()
        , list: list
      };

      $.ajax({
          url:  url
        , data: JSON.stringify(data)
        , success: function() {
          location = "#home";
        }
        , error: function() {
          Msg.alert("保存失败");
        }
      });
    });
  };

  var load = function(data) {
    if (!data) return;

    //cache the date;
    edit.data = data;
    $editDate.val(data.date);
    $editNote.val(data.note);

    $editTable.datagrid({
      columns:[[
          {field: "name", title: "名称", tip: true}
        , {field: "type", title: "类别", tip: true}
        , {field: "sum",  title: "金额"}
      ]], edit: true, add: "添加记录", del: "删除选中"
    }).datagrid("loadData", {rows: data.list});
  };

  //cache data
  edit.data = {};

  edit.edit = function() {
    url = "account_edit.svr";
    init("修改帐本");

    var data = $(".account.selected").data("data");
    load(data);
  };

  edit.newer = function() {
    url = "account_newer.svr";
    init("新建空帐本");

    //Create new asset based on last month
    var data = $(".account").eq(0).data("data");
    if (data) {
      data.note = "[ 基于{0}新建 ]".format(data.date);
    } else {
      data = { list:[ {} ], note: "" };
    }
    data.date = Utility.getDate();
    load(data);
  };

  bind();

  return edit;
})();

//Change settings, etc change password
iCalc.Settings = (function() {

  $("#changepass").validate({
    rules: {
        oldpass: {required: true, minlength: 3, maxlength: 32}
      , newpass: {required: true, minlength: 3, maxlength: 32}
      , rptpass: {required: true, minlength: 3, maxlength: 32, equalTo: newpass}
    },
    submitHandler: function() {
      $.ajax({
          url: "set_pass.svr"
        , dataType: "json"
        , data: JSON.stringify({
            oldpass: $("#oldpass").val()
          , newpass: $("#newpass").val()
        })
        , success: function(data) {
          data.msg
            ? Msg.alert(data.msg)
            : location.href = "#home";
        }
      });
    }
  });

})();