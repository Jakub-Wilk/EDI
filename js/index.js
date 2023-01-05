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

const create_data_showcase = data => {
    const data_container = document.querySelector("#data-container");
    for (const data_point of data) {

        const add_node = (name, parent, data_source, set_text=true) => {
            const new_node = document.createElement("div");
            parent.appendChild(new_node);
            new_node.classList.add(name.replace("_", "-"));
            new_node.textContent = set_text ? `${name.replace('_', ' ')}: ${data_source[name]}` : '';
            return new_node;
        }

        const data_parent = add_node("data-point", data_container, null, false);
        const identity_container = add_node("identity-container", data_parent, null, false)

        const add_identity_node = (name, set_text=true) => { return add_node(name, identity_container, data_point, set_text) }

        add_identity_node("username");
        add_identity_node("email");
        add_identity_node("age");

        const nationality = add_identity_node("nationality", false);
        nationality.innerHTML = `
            <span class='nationality-label'>
                nationality:
            </span>
            <span class='nationality-flag'>
                ${country_code_to_emoji(data_point["nationality"])}
            </span>
            `;

        const website_visits_container = add_node("website-visits-container", data_parent, null, false)

        const website_visits_label = add_node("website-visits-label", website_visits_container, null, false);
        website_visits_label.textContent = "website visits: "

        const website_visits = add_node("website_visits", website_visits_container, null, false);

        for (const website_visit of data_point["website_visits"]) {
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

const fetch_data = () => {
    // fetch('https://my.api.mockaroo.com/website_entries.json?key=7d9d28a0')
    fetch('website_entries.json')
        .then(response => {
            return response.ok ? response.json() : (() => { throw Error(response.statusText) })();
        })

        .then(data => {
            create_data_showcase(data)
        })

        .catch(error => {
            console.log("fetch error");
        })
}

document.querySelector("body").onload = fetch_data

let cursor = document.querySelector("#cursor")
document.querySelector("body").onmousemove = (e) => {
    // e.clientY is the Y position of the mouse cursor.
    // cursor.offsetHeight is the height of the circular cursor in pixels
    // half of it is subtracted from the Y position so the circular cursor is centered on the real cursor
    cursor.style.top = `${e.clientY - cursor.offsetHeight / 2}px`;
    cursor.style.left = `${e.clientX - cursor.offsetWidth / 2}px`;
}