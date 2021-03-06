/*
# Copyright (c) 2017 LINE Corporation
# These sources are released under the terms of the MIT license: see LICENSE
*/

function silence_tag() {
  var labels = $.parseJSON(this.dataset.labels);
  var form = $('#silence-form')
  for (var label in labels) {
    var value = labels[label]
    console.log('Adding %s %s', label, value)

    form.find('a.' + label).remove()

    input = $('<input type="hidden" class="form-control" />')
    input.val(value).attr('name', 'label.' + label)

    span = $('<a class="label label-warning"></a>').addClass(label)
    span.attr('onclick', 'this.parentNode.removeChild(this); return false;')
    span.text(label + ':' + value)
    span.append(input)
    span.append($('<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>'))

    form.find('div.labels').append(span)
  }

  form.show();
}

function update_page(data) {
  for (var key in data) {
    console.log("Replacing %s", key)
    var ele = $(data[key])
    ele.find("a[data-labels]").click(silence_tag);
    $(key).replaceWith(ele)
  }
}

$(document).ready(function() {
  $("a[data-labels]").click(silence_tag);
  $('[data-toggle="popover"]').popover();
  $('[data-toggle="tooltip"]').tooltip();
  $.ajax("/ajax/alert").done(update_page);
  $.post("/ajax/silence", {
    'referer': window.location.toString()
  }).done(update_page);

  $('[data-source]').click(function() {
    var btn = $(this)
    var query = btn.data('source') == 'self' ? btn.text()  : $(btn.data('source')).val();

    $(btn.data('target')).html('Loading...').show();
    btn.data('query', query)
    console.log("Testing Query: %s", query)
    $.post(btn.data('href'), btn.data()).done(update_page);
  })

  $("select[data-ajax]").each(function(index) {
    var ele = $(this)
    var tgt = $(ele.data('target'))

    $.get(ele.data('ajax')).done(function(data){
      data.data.forEach(function(item){
        var option = $('<option>')
        option.html(item)
        option.val(item)
        option.appendTo(ele)
      })

      tgt.typeahead({
        source: data.data,
        items: "all",
        updater: function(item) {
          return item + ele.data("append")
        }
      })
    })

    ele.change(function(){
      var replacement = ele.val() ? ele.val() + ele.data("append") : ""
      tgt.selection("replace", {text: replacement, mode: "before"});
      tgt.focus()
    });

  })

  $('.silence_start').datetimepicker({
    format: 'YYYY-MM-DD HH:mm'
  });
  $('.silence_end').datetimepicker({
    format: 'YYYY-MM-DD HH:mm',
    useCurrent: false //Important! See issue #1075
  });
  $(".silence_start").on("dp.change", function(e) {
    $('.silence_end').data("DateTimePicker").minDate(e.date);
  });
  $(".silence_end").on("dp.change", function(e) {
    $('.silence_start').data("DateTimePicker").maxDate(e.date);
  });
});

$('#silence-form-close').click( function() {
  $('#silence-form').hide();
});
