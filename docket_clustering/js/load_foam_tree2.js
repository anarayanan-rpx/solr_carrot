function get_range_val() {
  var t = document.getElementById("myRange");
  document.getElementById("range_val").innerHTML = t.value;
}

(function(console){
    console.save = function(data, filename){
        if(!data) {
            console.error('Console.save: No data')
            return;
        }
        if(!filename) filename = 'console.json'
        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }
        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')
        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }
})(console)

function get_solr_url() {
  var t = "",
    e = $("#include_abstract").is(":checked"),
    a = "",
    o = "";
  return (
    "" != document.getElementById("MaxWordsPerLabel").value &&
      (t =
        "&STCClusteringAlgorithm.maxDescPhraseLength=" +
        document.getElementById("MaxWordsPerLabel").value),
    1 == e && (a = "&carrot.snippet=docket_text"),
    (host = "172.16.0.208:8080"),
    (collection = "docket_info"),
    (query = document.getElementById("query").value),
    (algorithm = document.getElementById("algorithm").value),
    (cluster_size = document.getElementById("myRange").value),
    (raw = document.getElementById("raw").value),
    "stc" == document.getElementById("algorithm").value
      ? (o =
          "http://" +
          host +
          "/solr/" +
          collection +
          "/clustering?q=" +
          query +
          "&clustering.engine=stc&STCClusteringAlgorithm.maxClusters=" +
          cluster_size +
          "&rows=" +
          raw +
          "&echoParams=all&wt=json&STCClusteringAlgorithm.ignoreWordIfInHigherDocsPercent=0.1&STCClusteringAlgorithm.maxPhraseOverlap=0.60" +
          t +
          a)
      : "lingo" == document.getElementById("algorithm").value
      ? (o =
          "http://" +
          host +
          "/solr/" +
          collection +
          "/clustering?q=" +
          query +
          "&clustering.engine=lingo&LingoClusteringAlgorithm.desiredClusterCountBase=" +
          cluster_size +
          "&rows=" +
          raw +
          "&echoParams=all&wt=json&MinLengthLabelFilter.enabled=true&StopWordLabelFilter.enabled=true&NumericLabelFilter.enabled=true&QueryLabelFilter.enabled=true&GenitiveLabelFilter.enabled=true&CompleteLabelFilter.enabled=true&CaseNormalizer.dfThreshold=3" +
          a)
      : "kmeans" == document.getElementById("algorithm").value &&
        (o =
          "http://" +
          host +
          "/solr/" +
          collection +
          "/clustering?q=" +
          query +
          "&clustering.engine=kmeans&BisectingKMeansClusteringAlgorithm.clusterCount=" +
          cluster_size +
          "&rows=" +
          raw +
          "&echoParams=all&wt=json&BisectingKMeansClusteringAlgorithm.maxIterations=25&TermDocumentMatrixBuilder.titleWordsBoost=2.0&CaseNormalizer.dfThreshold=3&BisectingKMeansClusteringAlgorithm.labelCount=1" +
          a),
    o
  );
}
function check_algo(t) {
  "stc" == t.value
    ? ((document.getElementById("MaxWordsPerLabel").style.display = "inline"),
      (document.getElementById("l1").style.display = "inline"))
    : ("lingo" != t.value && "kmeans" != t.value) ||
      ((document.getElementById("MaxWordsPerLabel").style.display = "none"),
      (document.getElementById("l1").style.display = "none"));
}
function CreateTableFromJSON(t) {
  (uniq_data = uniq(t)),
    $("#t1").DataTable({
      data: uniq_data,
      destroy: !0,
      columns: [
          
        {
          title: "lit_id",
          data: "lit_id",
          render: function(t, e, a, o) {
            return (t =
              '<a target="_blank" href="http://st-insight.rpxcorp.com/lit/' +
              t +
              '">' +
              t +
              "</a>");
          }
        },
        {title: "docket_id",
          data: "id"},
        { title: "docket_text", data: "title" }
      ],
      scrollY: "70vh"
    });
    debugger
}
function uniq(t) {
  return Array.from(new Set(t));
}
function get_sorted_array(t, e) {
  for (var a = [], o = 0; o < t.length; o++)
    for (var r = 0; r < e.length; r++)
      e[r] == t[o].id && a.push({ id: t[o].docket_id, title: t[o].docket_text, lit_id: t[o].lit_id });
  return a;
}
var generate = function(t, e, a, o) {
  if (0 != t) {
    if (null !== a) {
      var r = '"' + a.split(",").join('" OR "') + '"';
      e += "&fq=id:(" + r + ")";
    }
    var l = [],
      n = [];
    return (
      $.ajax({
        url: e,
        async: !1,
        type: "GET",
        dataType: "json",
        success: function(a) {
          (pat_data = a.response.docs), (cluster_data = a.clusters);
          for (var o = cluster_data.length, r = 0; r < o; r++) {
            var s = cluster_data[r].docs.length > 10,
              i = cluster_data[r].labels[0];
            l.push({
              label: i + "(" + cluster_data[r].docs.length + ")",
              docs: cluster_data[r].docs,
              expandable: s,
              weight: (s ? o : 1) * cluster_data[r].score,
              groups: generate(t - 1, e, cluster_data[r].docs.toString())
            });
          }
          for (var d = 0; d < pat_data.length; d++)
            n.push({ id: pat_data[d].docket_id, title: pat_data[d].docket_text,lit_id:pat_data[d].lit_id });
        }
      }),
      [l, n]
    );
  }
};
$(document).ready(function() {
  var t = document.getElementById("myRange");
  (document.getElementById("range_val").innerHTML = t.value),
    $(document).ajaxStart(function() {
      $(".img-fluid").show(), $("#main_c").css("opacity", 0.4);
    }),
    $(document).ajaxComplete(function() {
      $(".img-fluid").hide(), $("#main_c").css("opacity", 1);
    });
  var e = get_solr_url();
  (fq = ""),
    "" != document.getElementById("pat_ids").value &&
      (fq =
        fq +
        "&fq=pat_id:(" +
        document.getElementById("pat_ids").value.replace(/,/g, " OR ") +
        ")"),
    "" != document.getElementById("portfolio_ids").value &&
      (fq =
        fq +
        "&fq=portfolio_ids:(" +
        document.getElementById("portfolio_ids").value.replace(/,/g, " OR ") +
        ")"),
    (e += fq),
    (levels = 1);
  var a = (function() {
      var t,
        e,
        a,
        o,
        r,
        l,
        n = new Tooltip("Test", { auto: !0 }),
        s = !1;
      function i() {
        n.hide(), (s = !1), window.clearTimeout(t);
      }
      function d() {
        if (l && l.label) {
          for (var t = [], i = 0; i < l.docs.length; i++)
            t.push(/:(.+)/.exec(l.docs[i])[1]);
          n.content("<b>" + l.tooltip_label + "</b>"),
            n.position(o, r),
            n.show(),
            (e = o),
            (a = r),
            (s = !0);
        }
      }
      return (
        document.body.addEventListener("mousemove", function(l) {
          (o = l.pageX),
            (r = l.pageY),
            s && Math.sqrt(Math.pow(o - e, 2) + Math.pow(r - a, 2)) > 10 && i(),
            window.clearTimeout(t),
            (t = window.setTimeout(d, 500));
        }),
        {
          group: function(t) {
            l = t;
          },
          hide: i
        }
      );
    })(),
    o = [],
    r = [];
  $.ajax({
    url: e,
    async: !0,
    type: "GET",
    dataType: "json",
    success: function(t) {
      (pat_data = t.response.docs),
        (all_pat_data = pat_data),
        (cluster_data = t.clusters);
      for (var l = cluster_data.length, n = 0; n < l; n++) {
        var s =
            cluster_data[n].docs.length > 10 &&
            get_sorted_array(all_pat_data, pat_data).length !=
              cluster_data[n].docs.length,
          i =
            cluster_data[n].labels[0] + "(" + cluster_data[n].docs.length + ")",
          d = i;
        o.push({
          label: i,
          tooltip_label: d,
          docs: cluster_data[n].docs,
          expandable: s,
          weight: (s ? l : 1) * cluster_data[n].score,
          groups: generate(levels - 1, e, cluster_data[n].docs.toString())
        });
      }
      for (var u = 0; u < pat_data.length; u++)
        r.push({ id: pat_data[u].docket_id, title: pat_data[u].docket_text, lit_id:pat_data[u].lit_id });
      CreateTableFromJSON(r);
      var c,
        p = new CarrotSearchFoamTree({
          id: "visualization",
          groupMinDiameter: 0,
          groupLabelMinFontSize: 3,
          groupBorderRadius: 0,
          parentFillOpacity: 0.5,
          groupBorderWidth: 2,
          groupInsetWidth: 3,
          groupSelectionOutlineWidth: 1,
          groupBorderWidthScaling: 0.25,
          dataObject: { groups: o },
          rolloutDuration: 0,
          pullbackDuration: 0,
          onGroupHold: function(t) {
            t.secondary || !t.group.expandable || t.group.groups
              ? this.open({ groups: t.group, open: !t.secondary })
              : m.load(t.group);
          },
          onGroupHover: function(t) {
            a.group(t.group);
          },
          onGroupMouseWheel: a.hide,
          onGroupExposureChanging: a.hide,
          onGroupOpenOrCloseChanging: a.hide,
          maxLabelSizeForTitleBar: 0,
          onGroupDoubleClick: function(t) {
            t.preventDefault();
            var e,
              a = t.secondary ? t.bottommostOpenGroup : t.topmostClosedGroup;
            a
              ? (CreateTableFromJSON(get_sorted_array(all_pat_data, a.docs)),
                t.secondary || !a.expandable || t.group.groups
                  ? this.open({ groups: a, open: !t.secondary })
                  : m.load(a),
                (e = t.secondary ? a.parent : a))
              : (e = this.get("dataObject")),
              this.zoom(e);
          },
          groupLabelDecorator: function(t, e, a) {
            e.group.expandable && !e.group.groups && (a.labelText += " »"),
              e.group.groups && !1 === e.browseable && (a.labelText += " »»");
          }
        });
      window.addEventListener("orientationchange", p.resize),
        window.addEventListener("resize", function() {
          window.clearTimeout(c), (c = window.setTimeout(p.resize, 300));
        }),
        $("button[name = 'visualize']").click(function() {
          e = get_solr_url();
          var t = [],
            a = [];
          (pats_list = ""),
            (port_folio_list = ""),
            "" != document.getElementById("pat_ids").value &&
              (pats_list =
                "(" +
                document.getElementById("pat_ids").value.replace(/,/g, " OR ") +
                ")"),
            "" != document.getElementById("portfolio_ids").value &&
              (port_folio_list =
                "(" +
                document
                  .getElementById("portfolio_ids")
                  .value.replace(/,/g, " OR ") +
                ")"),
            (data_json_all = "{}"),
            (data_json_pat = ""),
            (data_json_port = ""),
            "" != pats_list &&
              ((pats_list = JSON.stringify(pats_list)),
              (pats_list = pats_list.replace(/(^")|("$)/g, "")),
              (data_json_pat = 'filter:"pat_id:' + pats_list + '"')),
            "" != port_folio_list &&
              ((port_folio_list = JSON.stringify(port_folio_list)),
              (port_folio_list = port_folio_list.replace(/(^")|("$)/g, "")),
              (data_json_port =
                'filter:"portfolio_ids:' + port_folio_list + '"')),
            "" != data_json_pat && "" != data_json_port
              ? (data_json_all =
                  "{" + data_json_pat + "," + data_json_port + "}")
              : "" == data_json_pat && "" != data_json_port
              ? (data_json_all = "{" + data_json_port + "}")
              : "" != data_json_pat &&
                "" == data_json_port &&
                (data_json_all = "{" + data_json_pat + "}"),
            $.ajax({
              url: e,
              async: !0,
              type: "POST",
              dataType: "json",
              headers: { "Content-type": "text/json" },
              data: data_json_all,
              success: function(o) {
                (pat_data = o.response.docs),
                  (all_pat_data = pat_data),
                  (cluster_data = o.clusters);
                for (var r = cluster_data.length, l = 0; l < r; l++) {
                  var n = cluster_data[l].docs.length > 10,
                    s =
                      cluster_data[l].labels[0] +
                      "(" +
                      cluster_data[l].docs.length +
                      ")",
                    i = s;
                  a.push({
                    label: s,
                    tooltip_label: i,
                    docs: cluster_data[l].docs,
                    expandable: n,
                    weight: (n ? r : 1) * cluster_data[l].score,
                    groups: generate(
                      levels - 1,
                      e,
                      cluster_data[l].docs.toString()
                    )
                  });
                }
                for (var d = 0; d < pat_data.length; d++)
                  t.push({ id: pat_data[d].docket_id, title: pat_data[d].docket_text, lit_id: pat_data[d].lit_id });
                p.set({ dataObject: { groups: a } }), CreateTableFromJSON(t);
              }
            });
        });
      var g,
        _,
        m =
          ((g = p),
          {
            load: function(t) {
              t.groups ||
                t.loading ||
                (h.start(t),
                window.setTimeout(function() {
                  if (null !== t.docs.toString()) {
                    var a =
                      '"' +
                      t.docs
                        .toString()
                        .split(",")
                        .join('" OR "') +
                      '"';
                    (e = get_solr_url()),
                      (a = (a = JSON.stringify(a)).replace(/(^")|("$)/g, "")),
                      (data_json = '{filter:"id:(' + a + ')"}');
                  }
                  var o = t.tooltip_label;
                  o = o;
                  var r = [],
                    l = [];
                  $.ajax({
                    url: e,
                    async: !0,
                    headers: { "Content-type": "text/json" },
                    type: "POST",
                    dataType: "json",
                    data: data_json,
                    crossDomain: !0,
                    failure: function(t) {},
                    success: function(a) {
                      (pat_data2 = a.response.docs),
                        (cluster_data2 = a.clusters);
                      for (var n = cluster_data2.length, s = 0; s < n; s++) {
                        var i =
                            cluster_data2[s].docs.length > 10 &&
                            get_sorted_array(all_pat_data, t.docs).length !=
                              cluster_data2[s].docs.length,
                          d = cluster_data2[s].labels[0];
                        r.push({
                          label: d + "(" + cluster_data2[s].docs.length + ")",
                          tooltip_label:
                            o +
                            "&nbsp;&nbsp;--\x3e&nbsp;&nbsp;" +
                            d +
                            "(" +
                            cluster_data2[s].docs.length +
                            ")",
                          docs: cluster_data2[s].docs,
                          expandable: i,
                          weight: (i ? n : 1) * cluster_data2[s].score,
                          groups: generate(
                            levels - 1,
                            e,
                            cluster_data2[s].docs.toString()
                          )
                        });
                      }
                      for (var u = 0; u < pat_data2.length; u++)
                        l.push({
                          id: pat_data2[u].docket_id,
                          title: pat_data2[u].docket_text,
                          lit_id: pat_data2[u].lit_id
                        });
                      (t.groups = r),
                        CreateTableFromJSON(l),
                        g.open({ groups: t, open: !0 }).then(function() {
                          h.stop(t);
                        });
                    }
                  });
                }, 500 + 1500 * Math.random()));
            }
          }),
        h =
          ((_ = p).set("wireframeContentDecorationDrawing", "always"),
          _.set("groupContentDecoratorTriggering", "onSurfaceDirty"),
          _.set("groupContentDecorator", function(t, e, a) {
            var o = e.group;
            if (o.loading) {
              var r = e.polygonCenterX,
                l = e.polygonCenterY,
                n = e.context,
                s = Date.now(),
                i = 0.3;
              s - o.loadingStartTime < 500 &&
                (i *= Math.pow((s - o.loadingStartTime) / 500, 2)),
                (e.shapeDirty || void 0 == o.spinnerRadius) &&
                  (o.spinnerRadius =
                    0.4 *
                    CarrotSearchFoamTree.geometry.circleInPolygon(
                      e.polygon,
                      r,
                      l
                    ));
              var d = (2 * Math.PI * (s % 1e3)) / 1e3;
              (n.globalAlpha = i),
                n.beginPath(),
                n.arc(r, l, o.spinnerRadius, d, d + Math.PI / 5, !0),
                (n.strokeStyle = "black"),
                (n.lineWidth = 0.3 * o.spinnerRadius),
                n.stroke(),
                _.redraw(!0, o);
            }
          }),
          {
            start: function(t) {
              (t.loading = !0),
                (t.loadingStartTime = Date.now()),
                _.redraw(!0, t);
            },
            stop: function(t) {
              t.loading = !1;
            }
          });
    }
  });
});
