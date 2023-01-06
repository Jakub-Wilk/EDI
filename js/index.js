'use strict';

const country_code_to_emoji = country_code => {
    const code_points = country_code
        .toUpperCase()
        .split('')
        // Flag emojis are just country codes, but written using special unicode region characters
        // 127462 is the code point for 'A' in the unicode region characters
        // we subtract 65 because 65 is 'A' as a regular letter, and we need it to be 0th character
        .map(char => 127462 + char.charCodeAt() - 65);
    return String.fromCodePoint(...code_points);
}

const create_data_showcase = user_data => {
    const data_container = document.querySelector("#data-container");
    for (const user of user_data) {

        const add_node = (name, parent, data_source, set_text=true) => {
            const new_node = document.createElement("div");
            parent.appendChild(new_node);
            new_node.classList.add(name.replace("_", "-"));
            new_node.textContent = set_text ? `${name.replace('_', ' ')}: ${data_source[name]}` : '';
            return new_node;
        }

        const data_parent = add_node("data-point", data_container, null, false);
        const identity_container = add_node("identity-container", data_parent, null, false)

        const add_identity_node = (name, set_text=true) => { return add_node(name, identity_container, user, set_text) }

        add_identity_node("username");
        add_identity_node("email");
        add_identity_node("age");

        const nationality = add_identity_node("nationality", false);
        nationality.innerHTML = `
            <span class='nationality-label'>
                nationality:
            </span>
            <span class='nationality-flag'>
                ${country_code_to_emoji(user.nationality)}
            </span>
            `;

        const website_visits_container = add_node("website-visits-container", data_parent, null, false)

        const website_visits_label = add_node("website-visits-label", website_visits_container, null, false);
        website_visits_label.textContent = "website visits: "

        const website_visits = add_node("website_visits", website_visits_container, null, false);

        for (const website_visit of user.website_visits) {
            const website_visit_node = add_node("website-visit", website_visits, null, false);

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

const create_chart_1 = user_data => {

    const ages = user_data.map(user => user.age);
    
    let sums_of_ages = new Array(100).fill(0);

    for (const age of ages){
        sums_of_ages[age]++;
    }
    
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

const user_data = fetch('website_entries.json') //fetch('https://my.api.mockaroo.com/website_entries.json?key=7d9d28a0')

document.querySelector("body").onload = () => {
    user_data
    .then(response => {
        return response.ok ? response.json() : (() => { throw Error(response.statusText) })();
    })

    .then(user_data => {
        create_data_showcase(user_data);
        create_chart_1(user_data);
        create_chart_2(user_data);
    })

    .catch(error => {
        console.log("fetch error", error);
    })

    let cursor = document.querySelector("#cursor")

    document.querySelector("body").onmousemove = (e) => {
        // e.clientY is the Y position of the mouse cursor.
        // cursor.offsetHeight is the height of the circular cursor in pixels
        // half of it is subtracted from the Y position so the circular cursor is centered on the real cursor
        cursor.style.top = `${e.clientY - cursor.offsetHeight / 2}px`;
        cursor.style.left = `${e.clientX - cursor.offsetWidth / 2}px`;
    }
}