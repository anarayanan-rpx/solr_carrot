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

function reload_foamtree(foamtree){
          $("#info").fadeOut(500);
          foamtree.set("dataUrl", get_solr_url());
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

function get_solr_url(){
        fq="";
        snippet=""
        stc_label_length="";
        include_abstract=$("#include_abstract").is(":checked");
        include_abstract_url="";
        url="";
        if(document.getElementById("snippet").value != "")
        {
          snippet="&"+document.getElementById("snippet").value;
        }

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

         url="http://"+host+"/solr/"+collection+"/clustering?q="+query+fq+snippet+"&clustering.engine=stc&STCClusteringAlgorithm.maxClusters="+cluster_size+"&rows="+raw+"&echoParams=all&wt=xslt&tr=c2.xsl&STCClusteringAlgorithm.ignoreWordIfInHigherDocsPercent=0.1&STCClusteringAlgorithm.maxPhraseOverlap=0.60"+stc_label_length+include_abstract_url;
        }
        else if(document.getElementById("algorithm").value == "lingo")
        {
           url="http://"+host+"/solr/"+collection+"/clustering?q="+query+fq+snippet+"&clustering.engine=lingo"+"&LingoClusteringAlgorithm.desiredClusterCountBase="+cluster_size+"&rows="+raw+"&echoParams=all&wt=xslt&tr=c2.xsl&MinLengthLabelFilter.enabled=true&StopWordLabelFilter.enabled=true&NumericLabelFilter.enabled=true&QueryLabelFilter.enabled=true&GenitiveLabelFilter.enabled=true&CompleteLabelFilter.enabled=true&CaseNormalizer.dfThreshold=3"+include_abstract_url;

        }
        else if(document.getElementById("algorithm").value == "kmeans")
        {
          url="http://"+host+"/solr/"+collection+"/clustering?q="+query+fq+snippet+"&clustering.engine=kmeans"+"&BisectingKMeansClusteringAlgorithm.clusterCount="+cluster_size+"&rows="+raw+"&echoParams=all&wt=xslt&tr=c2.xsl&BisectingKMeansClusteringAlgorithm.maxIterations=25&TermDocumentMatrixBuilder.titleWordsBoost=2.0&CaseNormalizer.dfThreshold=3&BisectingKMeansClusteringAlgorithm.labelCount=1"+include_abstract_url;
        }
return url;
}            