function OnLoadWindow()
{
   //UpdateSpieleTippsPerAJAX();
   DrawStatischeDiagramme();

   $("#dropdownlist_spieltag").selectify( { btnText: "" } );
   $("#spielerstatistik_dropdownlist_spieler").selectify();
   $("#dropdownlist_tipprunde").selectify( { btnText: "" } );

   //
   // color nickname
   //
   var nickname = GetQueryStringParams('nickname');

   if ( nickname != null )
   {
      $("#container_main_spieleruebersicht table tr[nick='" + nickname + "']").addClass('nick');
      $("#container_main_tippstatistik table tr[nick='" + nickname + "']").addClass('nick');
      $("#container_main_gewinnuebersicht table tr[nick='" + nickname + "']").addClass('nick');
      $("#container_main_spieltagrekorde table tr[nick='" + nickname + "']").addClass('nick');
      $("#container_main_saisonrekorde table tr[nick='" + nickname + "']").addClass('nick');
      $("#container_main_ewige_tabelle table tr[nick='" + nickname + "']").addClass('nick');
      $("#container_main_5_jahres_tabelle table tr[nick='" + nickname + "']").addClass('nick');
   }

   //
   // selectedPlayer
   //
   var idxToSelect = 0;
   var dropdownlistSpieler = $('#spielerstatistik_dropdownlist_spieler');

   if ( nickname != null )
   {
      dropdownlistSpieler.children().each(function( index )
      {
         if ( $(this).text() == nickname )
         {
           idxToSelect = index;
           return ( false );
         }
      });
   }
   
   dropdownlistSpieler.prop('selectedIndex', idxToSelect).trigger('change');

   $('#nav_btn_tippstatistik_gesamt').addClass('active');

   //
   // waehle Navigationsbutton
   //
   $('#nav_btn_spieltag').addClass('active');
   SimulateDropdownlistSpieltagClick(StartSpieltag());

   //
   // Aus der Combobox mit Tipprundennamen den passenden waehlen
   // Sonst wuerde hier immer der erste - der aelteste - stehen
   //
   SetzeTipprundenNamen();
}

function GetQueryStringParams(paramName)
{
   var parameterString = window.location.search.substring(1);
   var parameter = parameterString.split('&');

   for (var i = 0; i < parameter.length; i++)
   {
      var paramKeyValue = parameter[i].split('=');

      if ( paramKeyValue.length == 2 )
      {
         if ( paramKeyValue[0] == paramName )
            return( paramKeyValue[1] );
      }
   }

   return (null);
}

function GetAktSpieltag()
{
   return( $("#dropdownlist_spieltag").prop("selectedIndex") + 1 );
}

function OnClickBlaetterpfeil(id,wert)
{
   if ( !($('#' + id).hasClass('disabled')) )
      SimulateDropdownlistSpieltagClick(GetAktSpieltag() + wert);
}

function SimulateDropdownlistSpieltagClick(spieltag)
{
   $("#dropdownlist_spieltag").prop("selectedIndex", spieltag - 1).trigger('change');
}

function OnClickDropdownlistSpieltag(index)
{
   //
   // Blaetterpfeile ein- und ausblenden
   //
   if ( index == 0 )
      $('#blaetterpfeil_links').addClass( "disabled" );
   else
      $('#blaetterpfeil_links').removeClass( "disabled" );

   if ( index == (LetzterSpieltag() - 1) )
      $('#blaetterpfeil_rechts').addClass( "disabled" );
   else
      $('#blaetterpfeil_rechts').removeClass( "disabled" );

   UpdateView();
}

function OnClickDropdownlistSpieler(index)
{
   UpdateSpielerstatistikDiagramme(index);
}

function UpdateSpielerstatistikDiagramme(idxSpieler)
{
   var container = $('#container_main_spielerstatistik');
   var diagrammeSpielerIdx = container.attr('spielerindex');

   if ( (diagrammeSpielerIdx == undefined) ||
        (idxSpieler != diagrammeSpielerIdx) )
   {
      DrawSpielerstatistikDiagramme(idxSpieler);
      container.attr('spielerindex', idxSpieler );
   }

   $('#spieler_auswahl div.sl-placeholder-container').focus();
}


function OnClickNavigationButton(element)
{
   var navigation_button = $(element);

   if ( !(navigation_button.hasClass('active')) )
   {
      navigation_button.addClass('active').siblings().removeClass('active');
      UpdateView();
   }
}

function UpdateSpieltagSpiele(spieltag)
{
   var spieltagSpiele = kicktipp_data.spiele[spieltag - 1];
   
   $('#tabelle_spiele tbody tr').each(function( index )
   {
      var spalten = $(this).find('td');
      var spiel = spieltagSpiele[index];
      
      spalten.eq(0).html(spiel.termin);
      spalten.eq(1).html(kicktipp_data.teams[spiel.idxHeimTeam].langName);
      spalten.eq(2).html(kicktipp_data.teams[spiel.idxAuswTeam].langName);
      spalten.eq(3).html(spiel.ergebnis);
   });
}

function UpdateSpieltagTabelle(spieltag)
{
   var spieltagSpiele = kicktipp_data.spiele[spieltag - 1];
   var spieltagTabelle = $('#tabelle_spieltag');
   var tab_kopf_zeilen = spieltagTabelle.find('thead tr');
   var sortByGesamt = (spieltagTabelle.attr('type') == 'gesamt');
   var spieltagTabPositionen = kicktipp_data.tabPositionen[spieltag - 1];
   var avgPunkteSpieltag = 0, maxPunkteSpieltag = 0;
   var paramNickname = GetQueryStringParams('nickname');
   
   SortiereSpieltagTabelle(spieltag, sortByGesamt);
   
   //
   // Berechnung der durchschnittlichen Spieltagpunkte
   //
   for ( var i = 0; i < spieltagTabPositionen.length; i++ )
   {
      var spieltagTabPosition = spieltagTabPositionen[i];
      var tipps = spieltagTabPosition.tipps;
      avgPunkteSpieltag += spieltagTabPosition.einzelPunkte;
         
      if ( spieltagTabPosition.einzelPunkte > maxPunkteSpieltag )
         maxPunkteSpieltag = spieltagTabPosition.einzelPunkte;
   }
      
   avgPunkteSpieltag /= spieltagTabPositionen.length;
   avgPunkteSpieltag = avgPunkteSpieltag.toFixed(1);
   
   //
   // 3 Ueberschriftszeilen
   //
   for ( var zeile = 1; zeile <= 3; zeile++ )
   {
      var spalten = tab_kopf_zeilen.eq(zeile - 1).find('th');
      
      if ( zeile == 3 )
      {
         if ( sortByGesamt )
            spalten.eq(1).html('+/-');
         else
            spalten.eq(1).html('');
         
         spalten.eq(12).html('\u2205 ' + avgPunkteSpieltag);
      }
   
      for ( var i = 0; i < spieltagSpiele.length; i++ )
      {
         var spiel = spieltagSpiele[i];
         var spalte = spalten.eq(3 + i);
         
         if ( zeile == 1 )
         {
            spalte.html(kicktipp_data.teams[spiel.idxHeimTeam].kurzName);
         }
         else if ( zeile == 2 )
         {
            spalte.find('span').html(spiel.ergebnis);
         }
         else if ( zeile == 3 )
         {
            spalte.html(kicktipp_data.teams[spiel.idxAuswTeam].kurzName);
         }
      }
   }   
   
   //
   // Positionen
   //
   var tab_positionen = spieltagTabelle.find('tbody tr');
   var rang = 0;
   
   for ( var i = 0; i < spieltagTabPositionen.length; i++ )
   {
      var spalten = tab_positionen.eq(i).find('td');
      var tabPosition = spieltagTabPositionen[i];
      
      //
      // Rang
      //
      {
         rang++;
         
         var spalte = spalten.eq(0);
         
         if ( i == 0 )
         {
            spalte.html(rang + '.');
         }
         else
         {
            var rangZeigen = true;
            
            if ( sortByGesamt )
            {
               if ( tabPosition.gesamtPunkte == spieltagTabPositionen[i - 1].gesamtPunkte )
                  rangZeigen = false;
            }
            else
            {
               if ( tabPosition.einzelPunkte == spieltagTabPositionen[i - 1].einzelPunkte )
                  rangZeigen = false;
            }
            
            if ( rangZeigen )
               spalte.html(rang + '.');
            else
               spalte.html('');
         }
      }
      
      //
      // Aufstieg / Abstieg
      //
      {
         var spalte = spalten.eq(1);
         
         if ( sortByGesamt )
         {
            if ( tabPosition.letzterRang == 0 )
               spalte.html('');
            else
            {
               var diff = tabPosition.rang - tabPosition.letzterRang;
               
               if ( diff == 0 )
               {
                  spalte.html('\u2022');
               }
               else if ( diff < 0 )
               {
                  spalte.html(-diff + '<img src="../../resources/img/up.png"/>');
               }
               else if ( diff > 0 )
               {
                  spalte.html(diff + '<span class="red_arrow"><img src="../../resources/img/down.png"/></span>');
               }             
            }
         }
         else
            spalte.html('');
      }   
      
      //
      // Nickname
      //
      spalten.eq(2).html(kicktipp_data.spieler[tabPosition.spielerIdx]);
      
      //
      // Tipps
      // 
      for ( var j = 0; j < tabPosition.tipps.length; j++ )
      {
         var tipp = tabPosition.tipps[j];
         var nullpkt = false;
         var spalte = spalten.eq(3 + j);
         
         if ( tipp.abgegeben )
         {
            if ( (tipp.heimTore.length > 0) && (tipp.auswTore.length > 0) )
            {
               if ( tipp.punkte > 0 )
               {
                  spalte.html(tipp.heimTore + ':' + tipp.auswTore + '<sub>' + tipp.punkte + '</sub>');
               }
               else
               {
                  spalte.html(tipp.heimTore + ':' + tipp.auswTore);
                  nullpkt = true;
               }
            }
            else
               spalte.html('-:-');
         }
         else
         {
            /*
            if ( spieltagSpiele[j].ergebnis != '-:-' ) // Wenn das Spiel zu Ende ist, d.h. ein reguläres Ergebnis hat und kein "-:-"
               spalte.html('');
            else
            {
               if ( (tipp.heimTore == '-') && (tipp.auswTore == '-') )
                  spalte.html('');
               else
                  spalte.html('?');
            }
            */
            spalte.html('');
         }
         
         if ( nullpkt )
            spalte.addClass('nullpkt');
         else
            spalte.removeClass('nullpkt');
      }
      
      var winnerOfTheDay = (maxPunkteSpieltag > 0) && (tabPosition.einzelPunkte == maxPunkteSpieltag);
      
      //
      // Differenz zum Durchschnitt
      //
      {
         var spalte = spalten.eq(12);
         var diffZumAvg = (tabPosition.einzelPunkte - avgPunkteSpieltag).toFixed(1);
         var o_avg = false;
         var u_avg = false;
         
         if ( diffZumAvg > 0 )
         {
            spalte.html('+' + diffZumAvg);
            o_avg = true;
         }
         else if ( diffZumAvg < 0 )
         {
            spalte.html(diffZumAvg);
            u_avg = true;
         }
         else
         {
            if ( maxPunkteSpieltag > 0 )
               spalte.html(diffZumAvg);
            else
               spalte.html('');
         }
         
         if ( o_avg )
            spalte.addClass('o_avg');
         else
            spalte.removeClass('o_avg');
         
         if ( u_avg )
            spalte.addClass('u_avg');
         else
            spalte.removeClass('u_avg');
      }   

      //
      // Spieltagpunkte
      //
      {
         var spalte = spalten.eq(13);
         var span = spalte.find('span');
         
         span.html(tabPosition.einzelPunkte);
         
         if ( (!sortByGesamt) || winnerOfTheDay )
            spalte.addClass('fett');
         else
            spalte.removeClass('fett');
         
         if ( winnerOfTheDay )
            span.addClass('winner_of_the_day');
         else
            span.removeClass('winner_of_the_day');
      }
      
      //
      // Gesamtpunkte
      //
      {
         var spalte = spalten.eq(14);
         
         spalte.html(tabPosition.gesamtPunkte);
         
         if ( sortByGesamt )
            spalte.addClass('fett');
         else
            spalte.removeClass('fett');
      }   
      
      //
      // Tagessieger - Zeilenfarbe
      //
      if ( winnerOfTheDay )
         tab_positionen.eq(i).addClass('winner_of_the_day');
      else
         tab_positionen.eq(i).removeClass('winner_of_the_day');
      
      //
      // nickname - Zeilenfarbe
      //
      if ( paramNickname == kicktipp_data.spieler[tabPosition.spielerIdx] )
         tab_positionen.eq(i).addClass('nick');
      else
         tab_positionen.eq(i).removeClass('nick');
   }
}

function UpdateSpieltag( spieltag )
{
   UpdateSpieltagSpiele( spieltag );
   UpdateSpieltagTabelle( spieltag );
}
 
function UpdateView()
{
   var selectedNavBtn = $('#navigationbar .navigationbutton.active');
   var container = $('#' + selectedNavBtn.attr('data'));

   container.css('display','block').siblings().css('display','none');

   if ( container.attr('id' ) == 'container_main_spieltag' )
   {
      UpdateSpieltag( GetAktSpieltag() );
   }
   else if ( container.attr('id' ) == 'container_main_spielerstatistik' )
   {
      UpdateSpielerstatistikDiagramme($('#spielerstatistik_dropdownlist_spieler').prop('selectedIndex'));
   }
}

function SortiereSpieltagTabelle(spieltag, sortByGesamt)
{
   var spieltagTabelle = $('#tabelle_spieltag');
   
   //
   // Sortieren
   //
   var spieltagTabPositionen = kicktipp_data.tabPositionen[spieltag - 1];
   var anzahl = spieltagTabPositionen.length;
   var temp, tausch;
   
   for ( i = 1; i <= anzahl - 1; i++ )
   {
      for ( j = i + 1; j <= anzahl; j++ )
      {
         tausch = false;
         
         if ( sortByGesamt )
         { 
            if ( spieltagTabPositionen[i - 1].gesamtPunkte < spieltagTabPositionen[j - 1].gesamtPunkte )
            {
               tausch = true;
            }
            else if ( spieltagTabPositionen[i - 1].gesamtPunkte == spieltagTabPositionen[j - 1].gesamtPunkte ) 
            {
               if ( kicktipp_data.spieler[spieltagTabPositionen[i - 1].spielerIdx].toUpperCase() > kicktipp_data.spieler[spieltagTabPositionen[j - 1].spielerIdx].toUpperCase()  )
                  tausch = true;
            }
         }
         else
         {
            if ( spieltagTabPositionen[i - 1].einzelPunkte < spieltagTabPositionen[j - 1].einzelPunkte )
            {
               tausch = true;
            }
            else if ( spieltagTabPositionen[i - 1].einzelPunkte == spieltagTabPositionen[j - 1].einzelPunkte ) 
            {
               if ( kicktipp_data.spieler[spieltagTabPositionen[i - 1].spielerIdx].toUpperCase()  > kicktipp_data.spieler[spieltagTabPositionen[j - 1].spielerIdx].toUpperCase()  )
                  tausch = true;
            }
         }   

         if ( tausch )
         {
            temp = spieltagTabPositionen[i - 1];
            spieltagTabPositionen[i - 1] = spieltagTabPositionen[j - 1];
            spieltagTabPositionen[j - 1] = temp;
         }            
      }
   }
}   

function OnTableSwitch()
{
   var spieltagTabelle = $('#tabelle_spieltag');
   
   if ( spieltagTabelle.attr('type') == 'gesamt' )
      spieltagTabelle.attr('type', 'einzel');
   else
      spieltagTabelle.attr('type', 'gesamt');
   
   UpdateSpieltagTabelle(GetAktSpieltag());
}

function OnTippstatistikSwitch(element,tableType)
{
   var navigation_button = $(element);

   if ( !(navigation_button.hasClass('active')) )
   {
      navigation_button.addClass('active').siblings().removeClass('active');

      $('#container_main_tippstatistik table.gesamt').css('display', tableType == 'gesamt' ? 'table' : 'none');
      $('#container_main_tippstatistik table.hinrunde').css('display', tableType == 'hinrunde' ? 'table' : 'none');
      $('#container_main_tippstatistik table.rueckrunde').css('display', tableType == 'rueckrunde' ? 'table' : 'none');

      $('#container_main_tippstatistik #div_diagramm_spieltagpunkte_hinrunde').css('display', (tableType == 'gesamt') || (tableType == 'hinrunde') ? 'table' : 'none');
      $('#container_main_tippstatistik #div_diagramm_spieltagpunkte_rueckrunde').css('display', (tableType == 'gesamt') || (tableType == 'rueckrunde') ? 'table' : 'none');
   }
}

/*
function UpdateSpieleTipps(spieltag, nickname, spielGetipptArray)
{
   var tabPositionen = kicktipp_data.tabPositionen[spieltag - 1];
   
   for ( i = 0; i < tabPositionen.length; i++ )
   {
      if ( kicktipp_data.spieler[tabPositionen[i].spielerIdx] == nickname )
      {
         for ( var j = 0; j < spielGetipptArray.length; j++ )
         {
            if ( !tabPositionen[i].tipps[j].abgegeben )
            {
               if ( spielGetipptArray[j] ) 
                  tabPositionen[i].tipps[j].abgegeben = true;
               else
               {
                  tabPositionen[i].tipps[j].heimTore = '-';
                  tabPositionen[i].tipps[j].auswTore = '-';
               }
            }
         }
         
         break;
      }
   }
}

function CrossDomainRequestByJSONP( site, xpath, callback )
{
   var yql_base_url = "https://query.yahooapis.com/v1/public/yql?q=";
   var yql_select = "select * from html where url='" + site + "' and xpath='" + xpath + "'";
   var yql = yql_base_url + encodeURIComponent(yql_select) + "&format=json&callback=?";

   $.getJSON( yql, function (data)
   {
      if ( data )
         if ( typeof callback === 'function')
            callback(data);
   })
}

function UpdateSpieleTippsFuerSpieltagPerAJAX(runde,spieltagNr)
{
   var url = "http://www.kicktipp.de/" + runde + "/tippuebersicht?rankingGruppeId=0&wertung=einzelwertung&teilnehmerSucheId=&spieltagIndex=" + spieltagNr + "&sortBy=gesamtpunkte";
                                                       
   //CrossDomainRequestByJSONP(url, '//table[contains(@class, "kicktipp-tabs")]/tbody/tr[contains(@class,"kicktipp-pos")]', function( data )
   //CrossDomainRequestByJSONP(url, '//table[contains(@class, "tippuebersicht")]/tbody/tr[contains(@class,"kicktipp-pos")]', function (data)
   CrossDomainRequestByJSONP(url, '//table[contains(@class, "tippuebersicht")]/tbody/tr[contains(@class,"kicktipp-pos1")]', function (data)
   {
      var zeilen = data.query.results.tr;
      var anzahl = zeilen.length;

      for (var i = 0; i < anzahl; i++)
      {
         var zeile = zeilen[i];
         var nickname = zeile.td[2].div.content;
         var spielGetipptArray = new Array(9);

         for ( var idxColumn = 3; idxColumn <= 11; idxColumn++ )
         {
            var getippt = false;

            if ( zeile.td[idxColumn].content )
               getippt = (zeile.td[idxColumn].content.length == 0) ? false : true;
            
            spielGetipptArray[idxColumn - 3] = getippt;
         }

         UpdateSpieleTipps(spieltagNr, nickname, spielGetipptArray);
      }
      
      if ( GetAktSpieltag() == spieltagNr )
         UpdateSpieltagTabelle( spieltagNr );
   });
}
*/

//
// DIAGRAMME ff...
//

// 
// DIAGRAMME: helper functions ff...
//
function AppendCircle(container,class_name,cx,cy,r)
{
   return ( container.append("circle")
                     .attr("class", class_name)
                     .attr("cx",cx)
                     .attr("cy", cy)
                     .attr("r", r) );
}

function AppendLine(container,class_name,x1,y1,x2,y2)
{
   return( container.append("line")
                    .attr("class",class_name)
                    .attr("x1", x1)
                    .attr("y1", y1)
                    .attr("x2", x2)
                    .attr("y2", y2) );
}

function AppendRadialGradient(svg,identifier,cx,cy,r,gradientUnits,stops)
{
   var defs = svg.select("defs");
   
   if ( defs.empty() )
      defs = svg.append("defs");
   
   var grads = defs.
               append("radialGradient")
               .attr("cx", cx)
               .attr("cy", cy)
               .attr("r", r)
               .attr("id", identifier.name + "_grad" + identifier.idx);
               
   if ( gradientUnits )
      grads.attr("gradientUnits", gradientUnits);
   
   stops.forEach(function(d)
   {
      grads.append("stop").attr("offset", d[0]).attr("stop-color", d[1]);
   });
}   

function AppendLinearGradient(svg,identifier,x1,y1,x2,y2,spreadMethod,stops)
{
   var defs = svg.select("defs");
   
   if ( defs.empty() )
      defs = svg.append("defs");
   
   var grads = defs.
               append("linearGradient")
               .attr("x1", x1)
               .attr("y1", y1)
               .attr("x2", x2)
               .attr("y2", y2)
               .attr("id", identifier.name + "_grad" + identifier.idx);
               
   if ( spreadMethod )
      grads.attr("spreadMethod", spreadMethod);
   
   stops.forEach(function(d)
   {
      grads.append("stop").attr("offset", d[0]).attr("stop-color", d[1]);
   });
}

function AppendRect(container,class_name,x,y,width,height,fill)
{
   return( container.append("rect")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("width", width)
                    .attr("height", height)
                    .attr("shape-rendering", "crispEdges")
                    .attr("fill", fill) );
}

function AppendText(container,class_name,x,y,text)
{
   return( container.append("text")
                    .attr("class", class_name)
                    .attr("x", x)
                    .attr("y", y)
                    .text(text) );
}

function CreateSVG(id_container)
{
   var div = d3.select(id_container);
   var svg = div.select("svg");
   
   if ( svg.empty() )
   {
      svg = div
           .append("svg")
           .attr("width", div.style("width").replace("px", ""))
           .attr("height", div.style("height").replace("px", ""));
   }
   
   return ( svg );         
}  

function DrawPieChart(id_container, data, faktorPie, faktorLineBegin, faktorLineEnd, lineAbstand, labelAbstand)
{
   var svg = CreateSVG(id_container); 
   var chart = svg.select("g");
   var identifier = id_container.substring(1);

   var WIDTH = svg.attr("width");
   var HEIGHT = svg.attr("height");
      
   var radiusPie = (Math.min(WIDTH, HEIGHT) / 2) * faktorPie;
   var radiusLineBegin = (Math.min(WIDTH, HEIGHT) / 2) * faktorLineBegin;
   var radiusLineEnd = (Math.min(WIDTH, HEIGHT) / 2) * faktorLineEnd;
   
   var midAngle = function(d)
   {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
   }   

   var pie = d3.layout.pie()
             .sort(null)
             .value(function(d) { return d.value; });

   var arcPie = d3.svg.arc()
            .outerRadius(radiusPie)
            .innerRadius(0);
   
   var arcLineBegin = d3.svg.arc()
                      .outerRadius(radiusLineBegin)
                      .innerRadius(0);
                      
   var arcLineEnd = d3.svg.arc()
                      .outerRadius(radiusLineEnd)
                      .innerRadius(0);                   
   
   if ( chart.empty() )
   {
      data.forEach(function(d, i)
      {
         AppendRadialGradient(svg,{name: identifier, idx: i}, "0%", "0%", radiusPie * 2, "userSpaceOnUse", [[0, d.color], [0.45, d.color], [0.6, "#000000"]]);
      });
   }
   else
      chart.remove();      

   chart = svg.append("g")
      .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")");
   
   //
   // PIE SLICES
   //
   chart.append("g")
      .attr("class", "slices");
   
   var slices = chart.select(".slices").selectAll("path.slice")
      .data(pie(data));

   slices.enter()
      .insert("path")
      .style("fill", function (d, idx) { return "url(#" + identifier + "_grad" + idx + ")"; })
      .attr("class", "slice")
      .attr("d", arcPie);
   
   slices.exit()
      .remove();
   
   var lastArc = null;
   var lastY = null;
   var MIN_Y_DIFF = 11;
   
   var computeLineEnds = function(arc, label)
   {
      var coor = arcLineEnd.centroid(arc);
      var midAngleCurrentArc = midAngle( arc );
      
      if ( lastArc != null )
      {
         var midAngleLastArc = midAngle( lastArc );
         
         if ( ((midAngleCurrentArc <= Math.PI) && (midAngleLastArc <= Math.PI)) ||
              ((midAngleCurrentArc > Math.PI) && (midAngleLastArc > Math.PI)) )
         {
            // same side
            var virtual_arc = { startAngle: arc.startAngle, endAngle: arc.endAngle };
            var one_degree = Math.PI / 180.;
            
            while ( Math.abs( coor[1] - lastY ) < MIN_Y_DIFF )
            {
               virtual_arc.startAngle += one_degree;
               virtual_arc.endAngle += one_degree;
               
               coor = arcLineEnd.centroid(virtual_arc);
            }
         }
      }
      
      var coor2 = [coor[0], coor[1]];
      
      if ( midAngleCurrentArc <= Math.PI )
         coor2[0] += (label ? labelAbstand : lineAbstand);
      else
         coor2[0] -= (label ? labelAbstand : lineAbstand);
      
      return ( { end1: coor, end2: coor2 } );
   }

   //
   // LINES
   //
   chart.append("g")
      .attr("class", "lines");
      
   var lineFunction = d3.svg.line()
                      .interpolate("basis");   
                      
   var lines = chart.select(".lines").selectAll("line")
       .data(pie(data.filter(function(d) { return (d.value > 0); })));
   
   lines.enter()
        .append("path")
        .attr("d", function(d, idx)
        {
           var lineStart = arcLineBegin.centroid(d);
           var lineMiddle = arcLineEnd.centroid(d);
           var lineEnds = computeLineEnds(d, false);
           lastArc = d;
           lastY = lineEnds.end1[1];
           
           return( lineFunction([lineStart, lineMiddle, lineEnds.end1, lineEnds.end2]) );
        });
      
   lines.exit();
   
   //
   // TEXT LABELS 
   //
   lastArc = null;
   lastCoor = null;
   
   chart.append("g")
      .attr("class", "labels");   
      
   var textLabels = chart.select(".labels").selectAll("text")
      .data(pie(data.filter(function(d) { return (d.value > 0); })));
   
   textLabels.enter()
      .append("text")
      .attr("dy", ".35em")
      .text(function(d) { return d.data.label; })
      .attr("transform", function(d)
      { 
         var lineEnds = computeLineEnds(d, true);
         lastArc = d;
         lastY = lineEnds.end1[1];
         
         return "translate("+ lineEnds.end2 +")";
      })
      .style("text-anchor", function (d)
      {
         return midAngle(d) <= Math.PI ? "start" : "end";
      });
   
   textLabels.exit()
      .remove();

};

function GetAnzahlSpieltageFromAnzTeams(anzTeams)
{
   return ( (anzTeams - 1) * 2 );
}

function Percent( value, sum )
{
   return( ((value / sum * 100).toFixed(1)) + " %" );
}      

function SetDiagramTitle(id_diagramm,spielerName)
{
   var table_header = $(id_diagramm).parents('table').find('tr th[diagram_title]');
   var titel = table_header.attr('diagram_title');
   var diagrammUeberschrift = table_header.find('span');

   if ( spielerName != null )
      titel = titel + ' (' + spielerName + ')';

   diagrammUeberschrift.text( titel );
}

function SumArray(array, func)
{
   var sum = 0;

   for(var i = 0, count = array.length; i < count; i++) 
   {
      if ( func != null )
         sum += func( array[i] );
      else
         sum += array[i]; 
   }

   return ( sum );
}

// 
// ...ff DIAGRAMME: helper functions
//
function DrawChartSpieltagpunkte(id_container,dataMin, dataAvg, dataMax, anzTeams, rueckrunde)
{
   SetDiagramTitle(id_container, null);
   
   var svg = CreateSVG(id_container);
   
   var CHART_WIDTH  = svg.attr("width") - 60;
   var CHART_HEIGHT = svg.attr("height") - 70;
   var MAX_PUNKTE = 90;
   var MIN_PUNKTE = 0;
   
   var xScaling = d3.scale.linear()
                  .range([0, CHART_WIDTH]);
   
   var yScaling = d3.scale.linear()
                  .range([CHART_HEIGHT, 0]);
   
   var line = d3.svg.line()
       .interpolate("monotone")
       .x(function(d) { return xScaling(d.spieltag); })
       .y(function(d) { return yScaling(d.punkte); })
       .defined(function(d) { return d.punkte != null; })
             
   svg.append("defs")
      .append("clipPath")
      .attr("id", "chart_clip")
      .append("rect")
      .attr("width", CHART_WIDTH)
      .attr("height", CHART_HEIGHT);
   
   var chart = svg.append("g")
               .attr("transform", "translate(50,20)");
           
   var spieltagVon, spieltagBis;
   
   if ( rueckrunde )
   {
      spieltagVon = anzTeams;
      spieltagBis = GetAnzahlSpieltageFromAnzTeams(anzTeams);
   }
   else
   {
      spieltagVon = 1;
      spieltagBis = anzTeams - 1;
   }
           
   xScaling.domain([spieltagVon - 0.5,spieltagBis + 0.5]);
   yScaling.domain([MIN_PUNKTE,MAX_PUNKTE]);
    
   //
   // Graue Spietagrechtecke (alternierend)
   //
   for ( var spieltag = spieltagVon + 1; spieltag <= spieltagBis; spieltag += 2 )
      AppendRect(chart,"", xScaling(spieltag) - 20, yScaling(MAX_PUNKTE), 40, yScaling(MIN_PUNKTE), "#CCCCCC" );
   
   //
   // Beschriftung der X-Achse
   //
   for ( var spieltag = spieltagVon; spieltag <= spieltagBis; spieltag++ )
      AppendText(chart, "axis_tick_label", xScaling(spieltag), CHART_HEIGHT + 25, spieltag );
   
   AppendText(chart, "axis_label", 0, 0, "Spieltag")
       .attr("transform", "translate(" + (CHART_WIDTH / 2) + "," + (CHART_HEIGHT + 42) + ")");   
   
   //
   // Beschriftung der Y-Achse
   //
   AppendText(chart, "axis_label", 0, 0, "Punkte")
      .attr("transform", "rotate(-90) translate(" + (-CHART_HEIGHT / 2) + ",-35)");
   
   //
   // Graue Gitterlinien
   //
   for ( var y = MIN_PUNKTE; y <= MAX_PUNKTE; y += 5 )
   {
      AppendLine(chart, "gridline", xScaling(spieltagVon - 0.5), yScaling(y), xScaling(spieltagBis + 0.5), yScaling(y) );
      AppendText(chart, "axis_tick_label", -20, yScaling(y) + 3, y );
   }   

   //
   // Linien
   //
   
   var prepareData = function(data)
   {
      var preparedData;
      
      if ( rueckrunde )
      {
         preparedData = data.slice(spieltagVon - 1 - 1,spieltagBis).map(function(value, index)
                        {
                           return { spieltag: index + spieltagVon - 1, punkte: value };
                        });
      }         
      else
      {
         preparedData = data.slice(0, spieltagBis + 1).map(function(value, index)
                        {
                           return { spieltag: index + 1, punkte: value };
                        });
      }
      
      return ( preparedData );
   };
   
   var serien =
   [
      { data: prepareData(dataMin), class_addition: "min", yOffset: 13, toFixed: 0 },
      { data: prepareData(dataAvg), class_addition: "avg", yOffset:  4, toFixed: 1 },
      { data: prepareData(dataMax), class_addition: "max", yOffset: -8, toFixed: 0 }
   ];
   
   var DrawPathWithCircles = function(serie)
   {
      var gSerie = chart.append("g");
      
      gSerie.append("path")
      .attr("class", "line " + serie.class_addition)
      .attr("d", function(d) { return line(serie.data); })
      .attr("clip-path", "url(#chart_clip)");

      serie.data.forEach(function(d)
      {
         if ( (d.spieltag >= spieltagVon) && (d.spieltag <= spieltagBis) )
         {
            if ( d.punkte != null )
            {
               AppendCircle(gSerie, "path_point " + serie.class_addition, xScaling(d.spieltag), yScaling(d.punkte), 4 );
            }   
         }   
      });
   };
   
   var DrawText = function(serie)
   {
      serie.data.forEach(function(d)
      {
         if ( (d.spieltag >= spieltagVon) && (d.spieltag <= spieltagBis) )
         {
            if ( d.punkte != null )
               AppendText(chart, "label " + serie.class_addition, xScaling(d.spieltag), yScaling(d.punkte) + serie.yOffset, d.punkte.toFixed(serie.toFixed) );
         }   
      });
   };
   
   serien.forEach(function(serie)
   {
      DrawPathWithCircles(serie);
   });
   
   serien.forEach(function(serie)
   {
      DrawText(serie);
   });
   
   //
   // Legende
   //
   var drawLegend = function(text,class_addition, xOffset, yOffset)
   {
      var legend = chart.append("g");
      
      AppendLine(legend,"legend_line " + class_addition, xOffset, yOffset - 4, xOffset + 16, yOffset - 4);
      AppendCircle(legend, "legend_point " + class_addition,xOffset + 8, yOffset - 4, 4 );
      AppendText(legend, "legend", xOffset + 25, yOffset, text );
   };
   
   drawLegend("Minimum", "min", -40, CHART_HEIGHT + 42);
   drawLegend("Durchschnitt", "avg", 55, CHART_HEIGHT + 42);
   drawLegend("Maximum", "max", 170, CHART_HEIGHT + 42);
}     

function DrawChartSpielausgangNachTendenz(id_container, tippVerteilungNachTendenz)
{
   var data_sum = SumArray(tippVerteilungNachTendenz);
   var title = data_sum + " Spiel" + ((data_sum != 1) ? "e" : "");
   
   SetDiagramTitle(id_container, title);
   
   if ( data_sum > 0 )
   {
      var chart_data = [ {label: "Auswärtssieg: " + Percent( tippVerteilungNachTendenz[2], data_sum ) + " (" + tippVerteilungNachTendenz[2] + ")", value: tippVerteilungNachTendenz[2], color: "#FF3030" }, 
                         {label: "Remis: "        + Percent( tippVerteilungNachTendenz[1], data_sum ) + " (" + tippVerteilungNachTendenz[1] + ")", value: tippVerteilungNachTendenz[1], color: "#FFFF00" }, 
                         {label: "Heimsieg: "     + Percent( tippVerteilungNachTendenz[0], data_sum ) + " (" + tippVerteilungNachTendenz[0] + ")", value: tippVerteilungNachTendenz[0], color: "#40DD40"} ];
                         
      DrawPieChart(id_container, chart_data, 0.7, 1.5, 1.75, 5, 10);
   }                      
}

function DrawChartErgebnisVerteilung(id_container, data)
{
   SetDiagramTitle(id_container, null);
   
   var svg = CreateSVG(id_container);
   var identifier = id_container.substring(1);
   
   var CHART_WIDTH  = 175;
   var CHART_HEIGHT = 176;
   
   var xScaling = d3.scale.linear()
                  .range([0, CHART_WIDTH]);
   
   var yScaling = d3.scale.linear()
                  .range([0, CHART_HEIGHT]);
   
   AppendRadialGradient(svg, {name: identifier, idx: 0}, 0.5, 0.3, 0.7, null, [[0, "#2f7ed8"], [1, "rgb(0,63,153)"]] );
   
   var chart = svg.append("g")
               .attr("transform", "translate(40,12)");
               
   //
   // prepare data
   //
   var data_sum = SumArray( data, function(d){ return d.anzahl } );
   var rest = 0;
   
   var temp_data = data.filter( function(item, index)
   { 
      var result = false;
      
      if ( index < 10 )
         result = true;
      else
         rest += item.anzahl;
      
      return ( result );
   });
   
   var chart_data = temp_data.map( function(item, index)
   { 
      return { label: item.ergebnis, value: item.anzahl }; 
   });
   
   chart_data.push( { label: "Rest", value: rest } );
   
   //
   // draw data
   //
   xScaling.domain([0,chart_data[0].value]);
   yScaling.domain([0.5, 11.5]);
   
   chart_data.forEach(function(d, i)
   {
      if ( d.value > 0 )
      {
         var xOutLabel;
         var width;
         
         AppendText(chart, "axis_tick_label", -10, yScaling(i + 1) + 4, d.label ); // Beschriftung der Y-Achse
         
         if ( i < (chart_data.length - 1) )
         {
            width = xScaling(d.value);
            
            AppendRect(chart, "", xScaling(0), yScaling(i + 1) - 7, width, 14, "url(#" + identifier + "_grad0)" ); // Balken
            
            if ( (width >= 37) || ((width >= 30) && ((d.value / data_sum) < 10.0)) )
               AppendText(chart, "in_label", width / 2, yScaling(i + 1) + 4, Percent(d.value, data_sum) ); // Balkeninnentext
            
            xOutLabel = width + 5;
         }
         else
            xOutLabel = xScaling(0) - 1;
            
         AppendText(chart, "out_label", xOutLabel, yScaling(i + 1) + 4, d.value ); // Balkenaussentext   
      }   
   });
}

function DrawChartPlatzierungsverlauf(id_container,spielerName,data,anzTeams)
{
   SetDiagramTitle(id_container,spielerName);
   
   var svg = CreateSVG(id_container);
   var chart = svg.select("g");
   
   var CHART_WIDTH  = 690;
   var CHART_HEIGHT = 245;
   
   var xScaling = d3.scale.linear()
                  .range([0, CHART_WIDTH]);
   
   var yScaling = d3.scale.linear()
                  .range([CHART_HEIGHT, 0]);
   
   var anzSpieltage = GetAnzahlSpieltageFromAnzTeams(anzTeams);
               
   xScaling.domain([0.5, anzSpieltage + 0.5]);
   yScaling.domain([anzTeams + 0.5, 0.5]);
   
   if ( chart.empty() )
   {
      chart = svg.append("g")
      .attr("transform", "translate(45,15)");

      var gStaticItems = chart.append("g")
          .attr("class", "static");
      
      //
      // Beschriftung der X-Achse
      //
      for ( var spieltag = 1; spieltag <= anzSpieltage; spieltag++ )
         AppendText(gStaticItems, "axis_tick_label", xScaling(spieltag), CHART_HEIGHT + 15, spieltag );
      
      AppendText(gStaticItems, "axis_label", 0, 0, "Spieltag")
      .attr("transform", "translate(" + (CHART_WIDTH / 2) + "," + (CHART_HEIGHT + 32) + ")");   
      
      //
      // Beschriftung der Y-Achse
      //
      for ( var y = 1; y <= anzTeams; y ++ )
         AppendText(gStaticItems, "axis_tick_label", -15, yScaling(y) + 3, y );
      
      AppendText(gStaticItems, "axis_label", 0, 0, "Platz")
      .attr("transform", "rotate(-90) translate(" + (-CHART_HEIGHT / 2) + ",-30)");
      
      //
      // Waagrechte Farbbänder
      //
      var colorBands = [ { platz:  1, color: "#80BB80" }, 
                         { platz:  2, color: "#80CC80" }, 
                         { platz:  3, color: "#80DD80" }, 
                         { platz:  4, color: "#80FF80" }, 
                         { platz:  5, color: "#AAFFAA" }, 
                         { platz:  6, color: "#AAFFAA" }, 
                         { platz: 16, color: "#FFCCCC" }, 
                         { platz: 17, color: "#FFAAAA" }, 
                         { platz: 18, color: "#FFAAAA" } ];
                         
      var widthColorBand = xScaling(2) - xScaling(1);
      var heightColorBand = yScaling(2) - yScaling(1);
      
      colorBands.forEach(function(d)
      {
         AppendRect(gStaticItems,"", xScaling(0.5), yScaling(d.platz - 0.5), widthColorBand * anzSpieltage, heightColorBand, d.color );
      });                   
      
      //
      // Senkrechte Gitterlinien
      //
      for ( var x = 0.5; x <= anzSpieltage + 0.5; x++ )
         AppendLine(gStaticItems, "gridline", xScaling(x), yScaling(0.5), xScaling(x), yScaling(anzTeams + 1) );
   }   
   else
      chart.select("g.variable").remove();
   
   //
   // Linien
   //
   var preparedData = data.map(function(value, index) { return { spieltag: index + 1, platz: value }; });
   
   var gVariableItems = chart.append("g")
       .attr("class", "variable");
   
   line = d3.svg.line()
   .interpolate("monotone")
   .x(function(d) { return xScaling(d.spieltag); })
   .y(function(d) { return yScaling(d.platz); });
   
   gVariableItems.append("path")
   .attr("class", "line")
   .attr("d", function(d) { return line(preparedData); });
   
   preparedData.forEach(function(d)
   {
      AppendCircle(gVariableItems, "path_point", xScaling(d.spieltag), yScaling(d.platz), 4 );
      AppendText(gVariableItems, "label", xScaling(d.spieltag), yScaling(d.platz) - 7, d.platz );
   });
}

function DrawChartSpieltagplatzierung(id_container,spielerName,spieltagplatzierung,idxSpieler,anzTeams,spiele)
{
   var data = spieltagplatzierung[idxSpieler];
   
   SetDiagramTitle(id_container,spielerName);
   
   var svg = CreateSVG(id_container);
   var chart = svg.select("g");
   var identifier = id_container.substring(1);
   
   var CHART_WIDTH  = 714;
   var CHART_HEIGHT = 89;
   
   var xScaling = d3.scale.linear()
                  .range([0, CHART_WIDTH]);
   
   var yScaling = d3.scale.linear()
                  .range([CHART_HEIGHT, 0]);
   
   var anzSpieltage = GetAnzahlSpieltageFromAnzTeams(anzTeams);
               
   xScaling.domain([0.5, anzSpieltage + 0.5]);
   yScaling.domain([anzTeams + 0.5, 0.5]);
   
   if ( chart.empty() )
   {
      AppendLinearGradient(svg,{name: identifier, idx: 0},0,0,"100%",0,"pad",[[0, "#00BB00"], [0.5, "#00FF00"], [1, "#00BB00"]]);
      AppendLinearGradient(svg,{name: identifier, idx: 1},0,0,"100%",0,"pad",[[0, "#AAAA00"], [0.5, "#FFFF00"], [1, "#AAAA00"]]);
      AppendLinearGradient(svg,{name: identifier, idx: 2},0,0,"100%",0,"pad",[[0, "#BBBBBB"], [0.5, "#DDDDDD"], [1, "#BBBBBB"]]);
      
      chart = svg.append("g")
      .attr("transform", "translate(25,15)");

      var gStaticItems = chart.append("g")
          .attr("class", "static");
      
      //
      // Beschriftung der X-Achse
      //
      for ( var spieltag = 1; spieltag <= anzSpieltage; spieltag++ )
         AppendText(gStaticItems, "axis_tick_label", xScaling(spieltag), CHART_HEIGHT + 10, spieltag );
      
      AppendText(gStaticItems, "axis_label", 0, 0, "Spieltag")
      .attr("transform", "translate(" + (CHART_WIDTH / 2) + "," + (CHART_HEIGHT + 25) + ")");   
      
      //
      // Beschriftung der Y-Achse
      //
      AppendText(gStaticItems, "axis_label", 0, 0, "Platz")
      .attr("transform", "rotate(-90) translate(" + (-CHART_HEIGHT / 2) + ",-10)");
      
      //
      // Waagrechte Gitterlinien
      //
      for ( var y = 1; y <= anzTeams; y++ )
         AppendLine(gStaticItems, "gridline", xScaling(0.5), yScaling(y), xScaling(anzSpieltage + 0.5), yScaling(y) );
      
      var DrawLegend = function(x,y,text,color)
      {
         AppendRect(gStaticItems,"",x,CHART_HEIGHT + y - 11, 16, 13, color);
         
         AppendText(gStaticItems, "legend", 0, 0, text)
         .attr("transform", "translate(" + (x + 21) + "," + (CHART_HEIGHT + y) + ")");   
      };
      
      // Legende
      DrawLegend(-10, 25, "alleiniger Tagessieg","url(#" + identifier + "_grad0)" );
      DrawLegend(150, 25, "geteilter Tagessieg","url(#" + identifier + "_grad1)" );
   }   
   else
      chart.select("g.variable").remove();
   
   //
   // Linien
   //
   var preparedData = data.map(function(value, index) { return { spieltag: index + 1, platz: value }; });
   
   var gVariableItems = chart.append("g")
       .attr("class", "variable");
   
   preparedData.forEach(function(d)
   {
      AppendText(gVariableItems, "label", xScaling(d.spieltag), yScaling(d.platz) - 3, d.platz );

      var color;
      var spieltagAbgeschlossen = true;
      
      //
      // Alle Spiele des Spieltags durchgehen
      //
      for( var idxSpiel = 0; idxSpiel < (anzTeams / 2); idxSpiel++ )
      {
         if ( spiele[d.spieltag - 1][idxSpiel].ergebnis == '-:-' )
         {
            spieltagAbgeschlossen = false;
            break;
         }
      }
      
      if ( (d.platz == 1) && spieltagAbgeschlossen )
      {
         var color = "url(#" + identifier + "_grad0)";

         for( var sp_idx = 0; sp_idx < spieltagplatzierung.length; sp_idx++ )
         {
            if ( sp_idx != idxSpieler )
            {
               if ( spieltagplatzierung[sp_idx][d.spieltag - 1] == 1 )
               {
                  color = "url(#" + identifier + "_grad1)";
                  break;
               }
            }
         }
      }
      else
         color = "url(#" + identifier + "_grad2)";

      AppendRect( gVariableItems, "", xScaling(d.spieltag) - 8, yScaling(d.platz), 16, yScaling(anzTeams) - yScaling(d.platz), color );
   });
}

function DrawChartPunkteProMannschaft(id_container,spielerName,teams,data)
{
   SetDiagramTitle(id_container, spielerName);
   
   var svg = CreateSVG(id_container);
   var chart = svg.select("g");
   var identifier = id_container.substring(1);
   
   var CHART_WIDTH  = 190;
   var CHART_HEIGHT = 288;
   
   var xScaling = d3.scale.linear()
                  .range([0, CHART_WIDTH]);
   
   var yScaling = d3.scale.linear()
                  .range([0, CHART_HEIGHT]);
   
   xScaling.domain([0,data[0].punkte]);
   yScaling.domain([0.5, teams.length + 0.5]);
   
   if ( chart.empty() )
   {
      AppendRadialGradient(svg, {name: identifier, idx: 0}, 0.5, 0.3, 0.7, null, [[0, "#2f7ed8"], [1, "rgb(0,63,153)"]] );
      
      chart = svg.append("g")
             .attr("transform", "translate(140,6)");
   }
   else
      chart.select("g.variable").remove();
   
   var gVariableItems = chart.append("g")
       .attr("class", "variable");
   
   data.forEach(function(d, i)
   {
      var y = yScaling(i + 1);
      
      AppendText(gVariableItems, "axis_tick_label", -10, y + 4, teams[d.team].langName ); // Beschriftung der Y-Achse
      AppendRect(gVariableItems, "", xScaling(0), y - 7, xScaling(d.punkte), 14, "url(#" + identifier + "_grad0)" ); // Balken
      AppendText(gVariableItems, "in_label", xScaling(d.punkte) / 2, y + 4, d.treffer + "/" + d.spiele); // Balkeninnentext 
      AppendText(gVariableItems, "out_label", xScaling(d.punkte) + 5, y + 4, d.punkte ); // Balkenaussentext   
   });
}

//
// Weil hier auch der Chart-Bereich dynamisch ist, muss auch das Chart-Objekt neu erteugt werden!
//
function DrawChartPunkteabstand(id_container, spielerName, spieler, data)
{
   SetDiagramTitle(id_container,spielerName);
   
   var svg = CreateSVG(id_container);
   var chart = svg.select("g");
   var identifier = id_container.substring(1);
   
   //
   // Den Chart-Bereich müssen wir dynamisch bestimmen
   //
   // FRAME | SPIELER | LEFT_LABEL | CHART | RIGHT_LABEL | FRAME
   var FRAME_WIDTH = 5;
   var SPIELER_WIDTH = 122;
   var CHART_WITH_LABELS_WITDH = svg.attr("width") - FRAME_WIDTH - SPIELER_WIDTH - FRAME_WIDTH;
   
   var LABEL_WIDTH = 40;
   var leftLabelWidth = 5, rightLabelWidth = 5;
   var minValue = 0;
   var maxValue = -Number.MAX_VALUE;
   
   data.forEach( function(d)
   {
      if ( d.diff < 0 )
         leftLabelWidth = LABEL_WIDTH;
      else
         rightLabelWidth = LABEL_WIDTH;
      
      if ( d.diff < minValue )
         minValue = d.diff;
      
      if ( d.diff > maxValue )
         maxValue = d.diff;
   });
   
   var CHART_WIDTH = CHART_WITH_LABELS_WITDH - leftLabelWidth - rightLabelWidth;
   var CHART_HEIGHT = 289;
   
   var xScaling = d3.scale.linear()
                  .range([0, CHART_WIDTH]);
   
   var yScaling = d3.scale.linear()
                  .range([0, CHART_HEIGHT]);
  
   xScaling.domain([minValue,maxValue]);
   yScaling.domain([0.5, data.length + 0.5]);
  
   if ( chart.empty() )
   {
      AppendRadialGradient(svg,{name: identifier, idx: 0}, 0.5, 0.3, 0.7, null, [[0, "#80EE80"], [1, "rgb(65,175,65)"]] );   
      AppendRadialGradient(svg,{name: identifier, idx: 1}, 0.5, 0.3, 0.7, null, [[0, "#FF432E"], [1, "rgb(192,4,0)"]] );         
   }
   else
      chart.remove();
   
   chart = svg.append("g")
           .attr("transform", "translate(" + (FRAME_WIDTH + SPIELER_WIDTH + leftLabelWidth) + ",6)");
      
   data.forEach(function(d, i)
   {
      var y = yScaling(i + 1);
      
      AppendRect(chart, "", -leftLabelWidth, y - 8, CHART_WITH_LABELS_WITDH, 17, ((i % 2) == 0) ? "#EBEBEB" : "#FFFFFF" ); // Hinterhrundbalken
      AppendText(chart, "axis_tick_label", -leftLabelWidth - 5, y + 4, d.platz + ". " + spieler[d.spieler] ); // Beschriftung der Y-Achse
      
      if ( d.diff < 0 )
      {
         AppendRect(chart, "", xScaling(d.diff), y - 6, Math.max(1, xScaling(0) - xScaling(d.diff)), 13, "url(#" + identifier + "_grad1)" ); // Balken
         AppendText(chart, "label negative", xScaling(d.diff) -5, y + 4, d.diff ); // Balkenaussentext   
      }
      else if ( d.diff > 0 )
      {
         AppendRect(chart, "", xScaling(0), y - 6, Math.max(1, xScaling(d.diff) - xScaling(0)), 13, "url(#" + identifier + "_grad0)" ); // Balken
         AppendText(chart, "label positive", xScaling(d.diff) + 5, y + 4, "+" + d.diff ); // Balkenaussentext   
      }
      else
         AppendText(chart, "label", xScaling(d.diff), y + 4, d.diff ); // Balkenaussentext   
   });
}

function DrawChartTipptreffer(id_container, spielerName, data)
{
   SetDiagramTitle(id_container, spielerName);
   
   var data_sum = SumArray(data);
   
   if ( data_sum > 0 )
   {
      var chart_data = [ {label: "Kein Treffer: " + Percent( data[0], data_sum ), value: data[0], color: "#FF3030" }, 
                         {label: "Ergebnis: "     + Percent( data[3], data_sum ), value: data[3], color: "#004000" }, 
                         {label: "Tordifferenz: " + Percent( data[2], data_sum ), value: data[2], color: "#008000"},
                         {label: "Tendenz: "      + Percent( data[1], data_sum ), value: data[1], color: "#40DD40"} ];
                         
      console.log('Tipptreffer' );                         
      DrawPieChart(id_container, chart_data, 0.7, 1.45, 1.55, 10, 15);   
   }   
}

function DrawChartTippVerteilungNachTendenz(id_container, spielerName, data)
{
   SetDiagramTitle(id_container, spielerName);
   
   var data_sum = SumArray(data);
   
   if ( data_sum > 0 )
   {
      var chart_data = [ {label: "Gast: "  + Percent( data[2], data_sum ), value: data[2], color: "#FF3030" }, 
                         {label: "Remis: " + Percent( data[1], data_sum ), value: data[1], color: "#FFFF00" }, 
                         {label: "Heim: "  + Percent( data[0], data_sum ), value: data[0], color: "#40DD40"} ];
                    
      console.log('Tippverteilung' );
      DrawPieChart(id_container, chart_data, 0.7, 1.45, 1.55, 10, 15);   
   }
}

// 1 = Spieltagpunkteabstand zum Durchschnittswert
// 2 = Gesamtpunkteabstand zur Führung
function DrawChartPunkteAbstand(id_container,spielerName,data,anzTeams,rueckrunde,chartArt)
{
   SetDiagramTitle(id_container,spielerName);
   
   var svg = CreateSVG(id_container);
   var chart = svg.select("g");
   var identifier = id_container.substring(1);
   
   var CHART_WIDTH  = 690;
   var CHART_HEIGHT = 245;
   
   var xScaling = d3.scale.linear()
                  .range([0, CHART_WIDTH]);

   var yScaling = d3.scale.linear()
                  .range([CHART_HEIGHT, 0]);
   
   
   var spieltagVon, spieltagBis;
   
   if ( rueckrunde )
   {
      spieltagVon = anzTeams;
      spieltagBis = GetAnzahlSpieltageFromAnzTeams(anzTeams);
   }
   else
   {
      spieltagVon = 1;
      spieltagBis = anzTeams - 1;
   }
   
   var minValue = -0.1;
   var maxValue = 0.1;
   
   data.forEach( function(d)
   {
      if ( d != null )
      {
         if ( d < minValue )
            minValue = d;
         
         if ( d > maxValue )
            maxValue = d;
      }
   });
   
   if ( chartArt == 2 )
   {
      if ( Math.abs(minValue) > Math.abs(maxValue) )
      {
         maxValue = -minValue;
      }
      else if ( Math.abs(maxValue) > Math.abs(minValue) )
      {
         minValue = -maxValue;
      }
   }
   
   var GetNewMinMax = function( value )
   {
      var negative = (value < 0);
      var modulo;
      
      value = Math.floor(Math.abs(value));
      modulo = value % 5;
      
      if ( modulo == 0 )
         value += 5;
      else
         value += (10 - modulo);
         
      return ( negative ? -value : value ); 
   }
   
   minValue = GetNewMinMax( minValue );
   maxValue = GetNewMinMax( maxValue );
   
   xScaling.domain([spieltagVon - 0.5,spieltagBis + 0.5]);
   yScaling.domain([minValue, maxValue]);
   
   if ( chart.empty() )
   {
      //
      // Farben für die Balken
      //
      AppendRadialGradient(svg,{name: identifier, idx: 0} ,0.5, 0.3, 0.7, null, [[0, "#80EE80"], [1, "rgb(65,175,65)"]] );
      AppendRadialGradient(svg,{name: identifier, idx: 1} ,0.5, 0.3, 0.7, null, [[0, "#FF432E"], [1, "rgb(192,4,0)"]] );
      
      chart = svg.append("g")
      .attr("transform", "translate(45,15)");
      
      var gStaticItems = chart.append("g")
          .attr("class", "static");
      
      //
      // Graue Spietagrechtecke (alternierend)
      //
      for ( var spieltag = spieltagVon + 1; spieltag <= spieltagBis; spieltag += 2 )
         AppendRect(gStaticItems,"", xScaling(spieltag) - 20, yScaling(maxValue), 40, yScaling(minValue), "#CCCCCC" );    

      //
      // Beschriftung der X-Achse
      //
      for ( var spieltag = spieltagVon; spieltag <= spieltagBis; spieltag++ )
         AppendText(gStaticItems, "axis_tick_label", xScaling(spieltag), CHART_HEIGHT + 17, spieltag );
      
      AppendText(gStaticItems, "axis_label", 0, 0, "Spieltag")
          .attr("transform", "translate(" + (CHART_WIDTH / 2) + "," + (CHART_HEIGHT + 32) + ")");   
      
      //
      // Beschriftung der Y-Achse (nur Label)
      //     
      AppendText(gStaticItems, "axis_label", 0, 0, "Punkteabstand")
      .attr("transform", "rotate(-90) translate(" + (-CHART_HEIGHT / 2) + ",-30)");    
   }
   else
      chart.select("g.variable").remove();
      
   var gVariableItems = chart.append("g")
       .attr("class", "variable");
   
   if ( chartArt == 1 )
   {
      //
      // Beschriftung der Y-Achse (nur tick labels)
      //
      for ( var y = minValue; y <= maxValue; y += 5 )
         AppendText(gVariableItems, "axis_tick_label", -15, yScaling(y) + 3, y );
      
      //
      // Waagrechte Gitterlinien
      //
      for ( var y = minValue; y <= maxValue; y += 5 )
         AppendLine(gVariableItems, "gridline", xScaling(spieltagVon - 0.5), yScaling(y), xScaling(spieltagBis + 0.5), yScaling(y) );
   }
   else if ( chartArt == 2 )
   {
      var gridLines = [ minValue, 0, maxValue ];
      
      gridLines.forEach(function(d)
      {
         AppendText(gVariableItems, "axis_tick_label", -15, yScaling(d) + 3, d );
         AppendLine(gVariableItems, "gridline", xScaling(spieltagVon - 0.5), yScaling(d), xScaling(spieltagBis + 0.5), yScaling(d) );
      });
   }
   
   //
   // Balken
   //
   data.forEach(function(d, i)
   {
      if ( d != null )
      {
         var spieltag = i + 1;
         
         if ( (spieltag >= spieltagVon) && (spieltag <= spieltagBis) )
         {
            var yCoor0 = yScaling(0), yCoorBalkenende = yScaling(d), y = yScaling(d), text = d.toFixed((chartArt == 1) ? 1 : 0);
            
            if ( d < 0 )
            {
               AppendRect(gVariableItems, "", xScaling(spieltag) - 15, yCoor0, 30, yCoorBalkenende - yCoor0, "url(#" + identifier + "_grad1)" );
               AppendText(gVariableItems, "label negative", xScaling(spieltag), y + 12, text );
            }
            else if ( d > 0 )
            {
               AppendRect(gVariableItems, "", xScaling(spieltag) - 15, yCoorBalkenende, 30, yCoor0 - yCoorBalkenende, "url(#" + identifier + "_grad0)" );
               AppendText(gVariableItems, "label positive", xScaling(spieltag), y - 5, "+" + text );
            }
            else
               AppendText(gVariableItems, "label", xScaling(spieltag), y - 1, text );
         }   
      }   
   });
   
}
//
// ...ff DIALGRAMME
//