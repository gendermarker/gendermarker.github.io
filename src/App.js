import React from "react";

import './App.css';
import * as d3 from "d3";
import { geoAlbersUsa, geoPath } from "d3-geo";

import { feature } from "topojson-client";

/*****************
 * D3 components *
 *****************/

const colorDict = {
  "Yes, surgery not required": "#00c853",
  "Yes, surgery may be required": "#64dd17",
  "Yes, surgery required": "#aeea00",
  "Yes": "#00c853",
  "No": "#d50000",
  "Complicated": "#fbc02d",
  "In progress": "#2962ff",
  "Unknown": "#dddddd",
  "": "#000000"
};

function slugify(string) {
  return string.toLowerCase().replace(/ /g, '-');
}

function stateInfoLink(usState, key) {
  const transEqualityLink = `https://transequality.org/documents/state/${slugify(usState)}`;
  return transEqualityLink;
}

class USMap extends React.Component {
  componentDidMount() {
    const path = geoPath().projection(geoAlbersUsa());

    this.map = d3.select(this.svg).append('g');


    const setHoveredState = this.props.action;
    this.states = this.map.selectAll(".state")
        .data(feature(this.props.topology, this.props.topology.objects.us).features)
        .enter()
          .append("path")
            .attr("class", "state")
            .attr("d", path)
            .style("fill", d => colorDict[this.props.genderData[d.properties.name][this.props.colorKey]])
            .style("stroke", "#000")
            .style("stroke-width", "1")
            .on("mouseover", (ev, d) => {
              ev.preventDefault();
              // ev.stopPropagation();
              setHoveredState(d.properties.name);
            })
            .on("click", (ev, d) => {
              window.open(stateInfoLink(d.properties.name, this.props.colorKey));
            });
  }

  componentDidUpdate() {
    this.map.selectAll(".state")
          .style("fill", d => colorDict[this.props.genderData[d.properties.name][this.props.colorKey]]);
  }

  render() {
    const viewBox = `0 0 ${this.props.width} ${this.props.height}`;
    return <svg
      ref={ svg => this.svg = svg }
      id={this.props.id}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      />;
  }
}


function ViewButton({ action, colorKey, children }) {
    const handleClick = event => { console.log(event.target.value); action(event.target.value);}
    return <button value={colorKey} onClick={handleClick}> {children} </button>
}


function App() {
    const [genderData, setGenderData] = React.useState({});
    const [topology, setTopology] = React.useState({});
    const [loadingGender, setLoadingGender] = React.useState(true);
    const [loadingTopology, setLoadingTopology] = React.useState(true);
    const [colorKey, setColorKey] = React.useState("x_dl");
    const [hoveredState, setHoveredState] = React.useState("Alabama");

    React.useEffect( () => {
      d3.json("data/gender.json").then(gender => {
        setGenderData(gender); 
        setLoadingGender(false);
      });

      d3.json("data/us-albers.json").then(topology => {
        setTopology(topology);
        setLoadingTopology(false);
      });

      return () => undefined;
    }, []);

    const color = loadingGender ? "#000000" : colorDict[genderData[hoveredState][colorKey]];
    const style = {"color": color};

    return <> <main>
      <h1>US Gender Marker Map</h1>
      <section>
        <p>Hover a state to view its residents' rights. Information is current as of July 11, 2021.</p>
        <p>Click on a state to view resources, statutes, policy, court decisions, and more.</p>
        <ul>
          <li>View map for:</li>
          <li><ViewButton colorKey="x_dl" action={setColorKey}>nonbinary, driver's license</ViewButton></li>
          <li><ViewButton colorKey="x_bc" action={setColorKey}>nonbinary, birth certificate</ViewButton></li>
          <li><ViewButton colorKey="mtf_ftm" action={setColorKey}>binary</ViewButton></li>
        </ul>
        {!loadingGender && !loadingTopology && <USMap id="map" action={setHoveredState} colorKey={colorKey} width="1000" height="510" genderData={genderData} topology={topology}/>}
      </section>
      <footer>
        <h2>I live in <span style={style}>{ hoveredState }</span>. Can I...</h2>
        <div className="cards">
          <CanICard
            heading="change my gender marker to a different binary gender?"
            genderData={genderData}
            loadingGender={loadingGender}
            canIKey="mtf_ftm"
            usState={hoveredState}
          />
          <CanICard
            heading="obtain a nonbinary (X) gender marker on my driver's license or state ID?"
            genderData={genderData}
            loadingGender={loadingGender}
            canIKey="x_dl"
            usState={hoveredState}
          />
          <CanICard
            heading="obtain a nonbinary (X) gender marker on my birth certificate?"
            genderData={genderData}
            canIKey="x_bc"
            loadingGender={loadingGender}
            usState={hoveredState}
          />
        </div>
      </footer>
    </main>

    <footer>
      <h2>You are valid.</h2>
      <p><i>You</i> determine your gender, not your local or federal government. It is reprehensible that the US has not yet nationally recognized the existence of nonbinary genders.</p>
      <p>For peer support, call <a href="https://translifeline.org/">Trans Lifeline</a> or <a href="https://www.thetrevorproject.org">Trevor</a>.</p>
    </footer>
    </>;
}

function CanICard({ heading, genderData, loadingGender, canIKey, usState }) {
  return <div className="card">
    <h3> ...{ heading }</h3>
    {!loadingGender && genderData[usState][canIKey]}.
  </div>
}

export default App;
