$(document).ready(function() {

		var url_string = window.location.href;
		var url = new URL(url_string);
		var patents = url.searchParams.get("patents");
		var portfolio_ids = url.searchParams.get("portfolio_ids");
		var cluster = url.searchParams.get("cluster");
		//var url = 'http://qa-solr-test:8080/solr/patent_cluster/clustering?q=abstract_html_strip:*&rows=100&echoParams=all&wt=json&tr=c2.xsl&clustering.engine=stc&&clustering.engine=stc&STCClusteringAlgorithm.maxBaseClusters=10&STCClusteringAlgorithm.ignoreWordIfInHigherDocsPercent=0.1&fl=pat_id,portfolio_ids';
		var url = 'http://qa-solr-test:8080/solr/pat_cluster/clustering?omitHeader=true&echoParams=none&fl=pat_id&q=abstract_html_strip:*&clustering.engine=lingo&LingoClusteringAlgorithm.desiredClusterCountBase=10&rows=3000&wt=json&MinLengthLabelFilter.enabled=true&StopWordLabelFilter.enabled=true&NumericLabelFilter.enabled=true&QueryLabelFilter.enabled=true&GenitiveLabelFilter.enabled=true&CompleteLabelFilter.enabled=true&CaseNormalizer.dfThreshold=3';

		if (patents !== null){
			var pats_list = '\"'+patents.split(',').join('\" OR \"')+'\"';
			var patents_fq = '&fq=id:('+pats_list+')';
			//console.log(patents_fq)
			url=url+patents_fq;
		}
		if (portfolio_ids !== null){
			var portfolio_ids_fq = '&fq=portfolio_ids:('+JSON.parse('['+portfolio_ids+']').join(' OR ')+')';
			//console.log(portfolio_ids_fq)
			url=url+portfolio_ids_fq;
		}		

		console.log(url);
        getJsonData(url)
          .then(data => plotWordCloud(data,cluster)) // JSON-string from `response.json()` call
          .catch(error => console.error(error));
});

function setOtherTopicsWeight(data){
	var maxWeight = 0;
	var otherTopicsIndex=-1;
	for (var i=0;i < data.length; i++){
	  if (data[i].name == 'Other Topics')
	    otherTopicsIndex=i;
	  if (maxWeight < data[i].weight)
	    maxWeight=data[i].weight;
	}

	data[otherTopicsIndex].weight=maxWeight;
	return data;
}
function getChartTitle(cluster){
	if (cluster == null)
		return 'Wordcloud from SOLR';
	else
		return 'Wordcloud from SOLR ('+cluster+')';
}

function plotChat(data,cluster) {
        Highcharts.chart('container', {
            tooltip: {
                formatter: function () {
                    return 'Cluster <b>' + this.point.name+'('+this.point.docs.length+')</b>';
                }
            },
            series: [{
                type: 'wordcloud',
                data: data,
                name: 'Occurrences'

            }],
            title: {
                text: getChartTitle(cluster)
            },
                plotOptions: {
                series: {
                    cursor: 'pointer',
                    allowPointSelect: true,
                    events: {
                        click: function (e) {
                            // window.open('http://qa-solr-test:8084/amn/index.html?cluster='+e.point.name+'&patents='+e.point.docs,'_blank');
                            window.location.href = 'http://qa-solr-test:8084/ndas/index.html?cluster='+e.point.name+'&patents='+e.point.docs;
                        }
                    }
                }
            },
        });
}

function plotWordCloud(data,cluster){
        //console.log(JSON.stringify(data_raw));

		//var data = JSON.parse('{"response":{"numFound":693727,"start":0,"docs":[{"pat_id":509846},{"pat_id":509847},{"pat_id":509848}]},"clusters":[{"labels":["Connect"],"score":0.09746237168594427,"docs":["509846","509847"]},{"labels":["Other Topics"],"score":0,"other-topics":true,"docs":["509848"]}]}');

		var chartDataRow={};
		var chartData=[];
		var arrayLength = data.clusters.length;

		for (var i = 0; i < arrayLength; i++) {
		    //console.log(data.clusters[i]);
		    chartDataRow["name"]=data.clusters[i].labels[0];
		    chartDataRow["weight"]=data.clusters[i].score;
		    chartDataRow["docs"]=data.clusters[i].docs;
		    chartData.push(chartDataRow);
		    chartDataRow={};
		    //Do something
		}

		console.log(JSON.stringify(chartData));        

        plotChat(setOtherTopicsWeight(chartData),cluster);        
}

function getJsonData(url) {
  // Default options are marked with *
    return fetch(url,{
mode:'cors',
headers:{
     'Access-Control-Allow-Origin':'*'
  }}
)
    .then(response => response.json()); // parses response to JSON
}
