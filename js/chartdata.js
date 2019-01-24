var slider = document.getElementById("myRange");
var output = document.getElementById("range_val");
output.innerHTML = slider.value;
function init_foamtree(){
    var foamtree = new CarrotSearchFoamTree({
    visualizationSwfLocation: "swf/com.carrotsearch.visualizations.foamtree.swf",
    flashPlayerInstallerSwfLocation: "swf/playerProductInstall.swf",
    groupSizeWeighting: "score",
    id: "swf" // id of the DOM element into which to embed the visualization
  });

  return foamtree;
}

function reload_foamtree(foamtree, url){
          $("#info").fadeOut(500);
          foamtree.set("dataUrl", get_solr_data(1, url,null));
}




      function check_algo(that) {
        if (that.value == "stc") {
            document.getElementById("c_label_length").style.display = "inline";
            document.getElementById("l1").style.display = "inline";
        } else if (that.value == "lingo" || that.value == "kmeans"){
          document.getElementById("c_label_length").style.display = "none";
          document.getElementById("l1").style.display = "none";
        }

    }



function uniq(a) {
   return Array.from(new Set(a));
};

  function CreateTableFromJSON(data) {
        uniq_data=uniq(data);

         $('#t1').DataTable( {
        data: uniq_data,
        destroy: true,
        columns: [

            {
         data: "id",
         render: function(uniq_data, type, row, meta){

            uniq_data = '<a target="_blank" href="http://st-analyst.rpxcorp.com/#/search/patent/'+uniq_data+'">' + uniq_data + '</a>';


            return uniq_data;
         }
      } ,
      { data: "title"}
        ]
    } );
}
        var get_solr_data = (function () {
            var number = 0;


            return function (levels, url, patents, cluster) {
                if (levels == 0) {
                    return undefined;
                }

                if (patents !== null) {

                    var pats_list = '\"' + patents.split(',').join('\" OR \"') + '\"';
                    var patents_fq = '&fq=id:(' + pats_list + ')';
                
                    url = url + patents_fq;
                }

                var result=[];
                var pat_record=[];
                $.ajax(
                {
                    url: url,
                    async: false,
                    type: "GET",
                    dataType: "json",

                    success: function (data) {
                        pat_data = data.response.docs;



                        cluster_data = data.clusters;


                        var arrayLength = cluster_data.length;

                        for (var i = 0; i < arrayLength; i++) {


                            var expandable = cluster_data[i].docs.length >10 &&  cluster_data[i].labels!="Other Topics";
                            var sub_group = cluster_data[i].labels[0];
                            result.push({
                                label: sub_group,
                                docs: cluster_data[i].docs,
                                expandable: expandable,
                                weight: (expandable ? arrayLength : 1) * cluster_data[i].score,
                                groups: get_solr_data(levels - 1, url, cluster_data[i].docs.toString())
                            });

                        }


                    for (var j = 0; j < pat_data.length; j++) {

                         pat_record.push(
                                {
                                    id:pat_data[j].patnum,
                                    title:pat_data[j].title
                                    
                                });}
                         // debugger


                    }
                });


                return [result,pat_record];

            }
        })();



    function get_solr_url(){ fq=""; snippet=""
    stc_label_length="";
    include_abstract=$("#include_abstract").is(":checked");
    include_abstract_url=""; url="";
    if(document.getElementById("snippet").value != "") {
    snippet="&"+document.getElementById("snippet").value; }

        if(document.getElementById("c_label_length").value != "")
        {
          stc_label_length="&STCClusteringAlgorithm.maxDescPhraseLength="+document.getElementById("c_label_length").value;

        }

         if(include_abstract == true)
        {
          include_abstract_url="&carrot.snippet=abstract_html_strip";
        }


         if(document.getElementById("pat_ids").value != "")
        {
          fq=fq+"&fq=pat_id:("+document.getElementById("pat_ids").value.replace(/,/g, ' OR ')+")";
        }

        if(document.getElementById("portfolio_ids").value != "")
        {

          fq=fq+"&fq=portfolio_ids:("+document.getElementById("portfolio_ids").value.replace(/,/g, ' OR ')+")";
        }
        host=document.getElementById("host").value;
        collection=document.getElementById("collection").value;
        query=document.getElementById("query").value;
//        snippet=document.getElementById("snippet").value;
        algorithm=document.getElementById("algorithm").value;
        cluster_size=document.getElementById("myRange").value;
        raw=document.getElementById("raw").value;

        if (document.getElementById("algorithm").value == "stc")
        {

         url="http://"+host+"/solr/"+collection+"/clustering?q="+query+fq+snippet+"&clustering.engine=stc&STCClusteringAlgorithm.maxClusters="+cluster_size+"&rows="+raw+"&echoParams=all&wt=json&STCClusteringAlgorithm.ignoreWordIfInHigherDocsPercent=0.1&STCClusteringAlgorithm.maxPhraseOverlap=0.60"+stc_label_length+include_abstract_url;
        }
        else if(document.getElementById("algorithm").value == "lingo")
        {
           url="http://"+host+"/solr/"+collection+"/clustering?q="+query+fq+snippet+"&clustering.engine=lingo"+"&LingoClusteringAlgorithm.desiredClusterCountBase="+cluster_size+"&rows="+raw+"&echoParams=all&wt=json&MinLengthLabelFilter.enabled=true&StopWordLabelFilter.enabled=true&NumericLabelFilter.enabled=true&QueryLabelFilter.enabled=true&GenitiveLabelFilter.enabled=true&CompleteLabelFilter.enabled=true&CaseNormalizer.dfThreshold=3"+include_abstract_url;

        }
        else if(document.getElementById("algorithm").value == "kmeans")
        {
          url="http://"+host+"/solr/"+collection+"/clustering?q="+query+fq+snippet+"&clustering.engine=kmeans"+"&BisectingKMeansClusteringAlgorithm.clusterCount="+cluster_size+"&rows="+raw+"&echoParams=all&wt=json&BisectingKMeansClusteringAlgorithm.maxIterations=25&TermDocumentMatrixBuilder.titleWordsBoost=2.0&CaseNormalizer.dfThreshold=3&BisectingKMeansClusteringAlgorithm.labelCount=1"+include_abstract_url;
        }
       
return url;
};
 
 
        // window.onload = function()  {
            function get_cluster_data_and_tree(url){
                
            var tooltip = (function() {
              var tip = new Tooltip("Test", { auto: true });
          var shown = false;
          var timeout;
          var lastShownPageX, lastShownPageY;
          var pageX, pageY;
          var currentGroup;

          function hide() {
            tip.hide();
            shown = false;
            window.clearTimeout(timeout);
          }

           function show() {
            if (currentGroup && currentGroup.label) {
                var k=[];

              for (var x=0;x<currentGroup.docs.length;x++)
              {
                  k.push(/:(.+)/.exec(currentGroup.docs[x])[1]);
              }
             // k=uniq(k);



              // Set some example content on the tooltip.
              tip.content("<b>Patents Count: " + k.length + "</b>" );
              tip.position(pageX, pageY);
              tip.show();
              lastShownPageX = pageX;
              lastShownPageY = pageY;
              shown = true;
            }
          }


          function group(g) {
            currentGroup = g;

          }


           document.body.addEventListener("mousemove", function(e) {
            pageX = e.pageX;
            pageY = e.pageY;

            // Hide if the mouse pointer gets farther than 10px from the last tooltip location
            if (shown && Math.sqrt(Math.pow(pageX - lastShownPageX, 2) + Math.pow(pageY - lastShownPageY, 2)) > 10) {
              hide();
            }

            // Show the tooltip after the pointer stops for some time
            window.clearTimeout(timeout);
            timeout = window.setTimeout(show, 500)
          });
          return {
            group: group,
            hide: hide
          };
        })();



        
           // var url ='http://qa-solr-test:8080/solr/pat_cluster/clustering?omitHeader=true&echoParams=none&fl=patnum,title&q=abstract_html_strip:*&clustering.engine=lingo&LingoClusteringAlgorithm.desiredClusterCountBase=10&rows=1000&wt=json&MinLengthLabelFilter.enabled=true&StopWordLabelFilter.enabled=true&NumericLabelFilter.enabled=true&QueryLabelFilter.enabled=true&GenitiveLabelFilter.enabled=true&CompleteLabelFilter.enabled=true&CaseNormalizer.dfThreshold=3';
           var [clusters_data,patents_data]= get_solr_data(1, url,null);
       
           CreateTableFromJSON(patents_data);
           if ($('#visualization').attr("data-foamtree") == "embedded") {
                $('#visualization').removeAttr("data-foamtree");
                $('#visualization').html('');
           }
           // else{
            var foamtree = new CarrotSearchFoamTree({
                // Identifier of the HTML element defined above
                id: "visualization",

                // Remove restriction on the minimum group diameter, so that
                // we can render as many diagram levels as possible.
                groupMinDiameter: 0,

                // Lower the minimum label font size a bit to show more labels.
                groupLabelMinFontSize: 3,

                // Disable rounded corners, deeply-nested groups
                // will look much better and render faster.
                groupBorderRadius: 0,

                // Lower the parent group opacity, so that lower-level groups show through.
                parentFillOpacity: 0.5,

                // Lower the border radius a bit to fit more groups.
                groupBorderWidth: 2,
                groupInsetWidth: 3,
                groupSelectionOutlineWidth: 1,
                groupBorderWidthScaling: 0.25,

                // Generate some initial data
                dataObject: {
                    groups: clusters_data
                },

                // Use a simple fading animation
                rolloutDuration: 0,
                pullbackDuration: 0,

                // When the user holds the mouse button over a group,
                // load the data if needed.
                onGroupHold: function (e) {
                    if (!e.secondary && e.group.expandable && !e.group.groups) {
                        loader.load(e.group);

                    } else {
                        this.open({
                            groups: e.group,
                            open: !e.secondary
                        });
                   }
                },
                onGroupHover: function (event) {
            // Tell the tooltip which group is currently hovered on
            tooltip.group(event.group);

          },

         onGroupMouseWheel: tooltip.hide,
          onGroupExposureChanging: tooltip.hide,
          onGroupOpenOrCloseChanging: tooltip.hide,
          maxLabelSizeForTitleBar: 0,

                // Dynamic loading of groups does not play very well with expose.
                // Therefore, when the user double-clicks a group, initiate data loading
                // if needed and zoom in to the group.
                onGroupDoubleClick: function (e) {
                    e.preventDefault();
                    var group = e.secondary ? e.bottommostOpenGroup : e.topmostClosedGroup;
                    var toZoom;
                    if (group) {
                        CreateTableFromJSON(get_solr_data(1, url,group.docs.toString())[1]);
                        // Open on left-click, close on right-click
                        if (!e.secondary && group.expandable && !e.group.groups) {
                            loader.load(group);
                        } else {
                            this.open({
                                groups: group,
                                open: !e.secondary
                            });
                        }
                        toZoom = e.secondary ? group.parent : group;
                    } else {
                        toZoom = this.get("dataObject");
                    }
                    this.zoom(toZoom);
                },

                // Display a "+" if a group can be expanded
                groupLabelDecorator: function (opts, params, vars) {
                    if (params.group.expandable && !params.group.groups) {
                        vars.labelText += "\u00a0\u00bb";
                    }
                    if (params.group.groups && params.browseable === false) {
                        vars.labelText += "\u00a0\u00bb\u00bb";
                    }
                }
            });
        // }
            // Resize FoamTree on orientation change
            window.addEventListener("orientationchange", foamtree.resize);

            // Resize on window size changes
            window.addEventListener("resize", (function () {
                var timeout;
                return function () {
                    window.clearTimeout(timeout);
                    timeout = window.setTimeout(foamtree.resize, 300);
                }
            })());

            //
            // A simple utility for simulating the Ajax loading of data
            // and updating FoamTree with the newly loaded data.
            //
            var loader = (function (foamtree) {
                return {
                    load: function (group) {
                        if (!group.groups && !group.loading) {
                            spinner.start(group);

                            // Simulate loading from the server by a timeout
                            window.setTimeout(function () {
                                [group.groups,pat_record] = get_solr_data(1, url,group.docs.toString());
                                CreateTableFromJSON(pat_record);




                                // We need to open the group for FoamTree to update its model
                                foamtree.open({
                                    groups: group,
                                    open: true
                                }).then(function () {
                                    spinner.stop(group);
                                });
                            }, 500 + 1500 * Math.random());
                        }
                    }
                };
            })(foamtree);

            //
            // A simple utility for starting and stopping spinner animations
            // inside groups to show that some content is loading.
            //
            var spinner = (function (foamtree) {
                // Set up a groupContentDecorator that draws the loading spinner
                foamtree.set("wireframeContentDecorationDrawing", "always");
                foamtree.set("groupContentDecoratorTriggering", "onSurfaceDirty");
                foamtree.set("groupContentDecorator", function (opts, props, vars) {
                    var group = props.group;
                    if (!group.loading) {
                        return;
                    }

                    // Draw the spinner animation

                    // The center of the polygon
                    var cx = props.polygonCenterX;
                    var cy = props.polygonCenterY;

                    // Drawing context
                    var ctx = props.context;

                    // We'll advance the animation based on the current time
                    var now = Date.now();
                    // Some simple fade-in of the spinner
                    var baseAlpha = 0.3;
                    if (now - group.loadingStartTime < 500) {
                        baseAlpha *= Math.pow((now - group.loadingStartTime) /
                            500, 2);
                    }

                    // If polygon changed, recompute the radius of the spinner
                    if (props.shapeDirty || group.spinnerRadius ==
                        undefined) {
                        // If group's polygon changed, recompute the radius of the inscribed polygon.
                        group.spinnerRadius = CarrotSearchFoamTree.geometry
                            .circleInPolygon(props.polygon, cx,
                                cy) * 0.4;
                    }

                    // Draw the spinner
                    var angle = 2 * Math.PI * (now % 1000) / 1000;
                    ctx.globalAlpha = baseAlpha;
                    ctx.beginPath();
                    ctx.arc(cx, cy, group.spinnerRadius, angle, angle +
                        Math.PI / 5, true);
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = group.spinnerRadius * 0.3;
                    ctx.stroke();

                    // Schedule the group for redrawing
                    foamtree.redraw(true, group);
                });

                return {
                    start: function (group) {
                        group.loading = true;
                        group.loadingStartTime = Date.now();

                        // Initiate the spinner animation
                        foamtree.redraw(true, group);
                    },

                   stop: function (group) {
                        group.loading = false;
                    }
                };
            })(foamtree);
}

        // }

