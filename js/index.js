'use strict';

const country_code_to_emoji = country_code => {
    // This function converts a country code in ASCII to a country code using unicode region characters,
    // which allows is to be displayed as an emoji if the font supports it

    const code_points = country_code
        .toUpperCase()
        .split('')
        // 127462 is the code point for 'A' in the unicode region characters
        // we subtract 65 because 65 is 'A' in ASCII, and we need it to be 0th character
        .map(char => 127462 + char.charCodeAt() - 65);
    return String.fromCodePoint(...code_points);
}

const capitalized = string => {
    // this function makes the first letter of a string capitalized
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const create_data_showcase = user_data => {
    // This function creates the DOM structure for the Data Showcase

    const data_container = document.querySelector("#data-container");
    for (const user of user_data) {

        const add_node = (name, parent, data_source, set_text=true) => {
            // This is a helper function that creates a DOM node
            // name: will be used as a class name, and if set_text is true, as the key to retrieve data
            // parent: the parent node that this node will be attached to
            // data_source: the object that data will be retrieved from if set_text is true
            // set_text: a flag indicating if the node should have text set, or not

            const new_node = document.createElement("div");
            parent.appendChild(new_node);
            new_node.classList.add(name.replace("_", "-")); // class names should have dashes in place of underscores
            new_node.textContent = set_text ? `${capitalized(name).replace('_', ' ')}: ${data_source[name]}` : ''; // text inside of the node should have spaces in place of underscores
            return new_node; // return a reference to the node in case it needs further modification
        }

        // create a node that will hold all of the data inside of it
        const data_parent = add_node("data-point", data_container, null, false);
        // create a container for the identity data (everything except website visits)
        const identity_container = add_node("identity-container", data_parent, null, false)

        // helper function to make creating new nodes inside of the identity container shorter
        const add_identity_node = (name, set_text=true) => { return add_node(name, identity_container, user, set_text) }

        add_identity_node("username");
        add_identity_node("email");
        add_identity_node("age");

        // the nationality node will need special treatment so we need a reference to it so we can set the text manually
        const nationality = add_identity_node("nationality", false);
        // two spans are created so that the region code can have a separate font set
        // - this is done because Windows doesn't support rendering flag emojis by default
        nationality.innerHTML = `
            <span class='nationality-label'>
                Nationality:
            </span>
            <span class='nationality-flag'>
                ${country_code_to_emoji(user.nationality)}
            </span>
            `;

        
        const website_visits_container = add_node("website-visits-container", data_parent, null, false)

        const website_visits_label = add_node("website-visits-label", website_visits_container, null, false);
        website_visits_label.textContent = "Website visits: "

        const website_visits = add_node("website_visits", website_visits_container, null, false);

        for (const website_visit of user.website_visits) {
            const website_visit_node = add_node("website-visit", website_visits, null, false);

            // similar to before, we create a helper function to make creating nodes easier
            const add_visit_node = (name, set_text=true) => { return add_node(name, website_visit_node, website_visit, set_text) }
            
            add_visit_node("id");
            add_visit_node("browser");
            add_visit_node("ip_address");
            add_visit_node("entry_date");
            add_visit_node("entry_time");
            add_visit_node("session_length");
        }
    }
}

const hide_loading = () => {
    const loadings = document.querySelectorAll(".loading");
    for (const loading of loadings) {
        loading.style.display = "none";
    }
    document.querySelector("#chart-container").style.display = "flex"
}

const create_chart_1 = user_data => {

    // extract ages out of every user
    const ages = user_data.map(user => user.age);
    
    // create a 100-length array filled with zeroes
    let sums_of_ages = new Array(100).fill(0);

    // increase the number with the index of each age, thus creating sums of every age
    for (const age of ages){
        sums_of_ages[age]++;
    }
    
    // create an 80-length array filled with numbers 0-79; equivalent to `x_axis = list(range(80))` in Python
    const x_axis = [...Array(80).keys()];
   
    const chart1 = document.querySelector('#chart1');
    
    new Chart(chart1, {
        type: "bar",
        data: {
          labels: x_axis,
          datasets: [{
            label: " Number of users of this age",
            data: sums_of_ages,
            borderWidth: 1,
            backgroundColor: "#003F5C"
          }]
        },
        options: {  
            responsive: true,
            maintainAspectRatio: false
        }
      });

}

const create_chart_2 = user_data => {
    let visits = new Array(5).fill(0);

    for (const user of user_data){
        const number_of_visits = user.website_visits.length;
        visits[number_of_visits - 1]++;
    }

    const chart2 = document.querySelector('#chart2');

    new Chart(chart2, {
        type: "doughnut",
        data: {
            labels: ["1 visit", "2 visits", "3 visits", "4 visits", "5 visits"],
            datasets: [{
                label: " Number of people who visited this many times",
                backgroundColor: ["#003F5C","#58508D","#BC5090","#FF6361","#FFA600"],
                data: visits
            }]
        },
        options: {  
            responsive: true,
            maintainAspectRatio: false
        },
        hoverOffset: 4,
        });
}

const create_chart_3 = user_data => {
    // change the data to a list of dates of all website visits
    // if the site was visited twice on a given date, the date will occur twice in the list
    // the dates are also converted to ISO format to allow easy sorting
    const website_visit_dates = user_data
        .map(user => user.website_visits)
        .map(website_visits => website_visits.map((visit => visit.entry_date)))
        .reduce((accumulator, current) => accumulator.concat(current))
        .map(date => date.split("/"))
        .map(date => `${date[2]}-${date[1]}-${[date[0]]}`)
    
    // create a list of all unique dates occuring in the dataset, sorted
    const dates_in_data = Array.from(new Set(website_visit_dates)).sort()

    let dates_in_range = []

    // we want to get all dates between the earliest and latest one in the dataset,
    // because we also want to display dates which didn't have any visits attached, with a value of 0
    let start_date = new Date(dates_in_data[0])
    start_date.setHours(0,0,0,0)

    let end_date = new Date(dates_in_data[dates_in_data.length - 1])
    end_date.setHours(0,0,0,0)

    // iterate over every date between the earliest and latest from the dataset
    for (let i = start_date; i <= end_date; i.setDate(i.getDate() + 1)) {
        // push the date, formatted to the ISO format, to the dates_in_range array
        dates_in_range.push(`${i.getFullYear()}-${i.getMonth() + 1}-${i.getDate() < 10 ? '0' + i.getDate() : i.getDate()}`)
    }

    let data = {}
    // go through all possible dates, and count how many times any given date showed up in the dataset
    for (const date of dates_in_range) {
        data[date] = website_visit_dates.filter(visit_date => visit_date == date).length
    }

    new Chart(chart3, {
        type: "line",
        data: {
            datasets: [{
                label: "Number of visits",
                data: data,
                fill: false,
                tension: 0.5,
                borderColor: "#003F5C"
            }]
        },
        options: {  
            responsive: true,
            maintainAspectRatio: false
        }
        });
}

// this is global, because the fetch should start immediately when the script loads
const user_data = fetch('https://my.api.mockaroo.com/website_entries.json?key=7d9d28a0') // fetch('website_entries.json')

document.querySelector("body").onload = () => {
    // processing of the fetched data should only start after the whole body is loaded, because we need all DOM elements to be present
    user_data
    .then(response => {
        return response.ok ? response.json() : (() => { throw Error(response.statusText) })();
    })

    .then(user_data => {
        hide_loading();
        create_data_showcase(user_data);
        create_chart_1(user_data);
        create_chart_2(user_data);
        create_chart_3(user_data);
    })

    .catch(error => {
        console.error("Fetch error\n", error);
    })

    // cursor handling
    let cursor = document.querySelector("#cursor")
    document.querySelector("body").onmousemove = (e) => {
        // e.clientY is the Y position of the mouse cursor.
        // cursor.offsetHeight is the height of the circular cursor in pixels
        // half of it is subtracted from the Y position so the circular cursor is centered on the real cursor
        cursor.style.top = `${e.clientY - cursor.offsetHeight / 2}px`;
        cursor.style.left = `${e.clientX - cursor.offsetWidth / 2}px`;
    }
}