let currentPage = 1;
const itemsPerPage = 10;

$(document).ready(function () {
    $("#searchButton").on("click", function () {
        const username = $("#username").val();
        if (username) {
            fetchRepositories(username, 1, 10); // Fetch first page with 10 repositories
        } else {
            alert("Please enter a GitHub username.");
        }
    });
});

function fetchUserInfo(username) {
    const apiUrl = `https://api.github.com/users/${username}`;

    $.get(apiUrl)
        .done(function (data) {
            console.log("User Info:", data);
            displayUserInfo(data);
        })
        .fail(function (error) {
            console.error(`Error fetching user info: ${error.responseJSON.message}`);
        });
}
function displayRepositories(repositories) {
    const repositoriesContainer = $("#repositories");
    repositoriesContainer.empty();

    // Fetch and display user information
    const username = $("#username").val();
    fetchUserInfo(username);

    repositories.forEach(function (repo) {
        const repoCard = `<div class="col-md-4 mb-4 ">
                            <div class="card ">
                                <div class="card-body">
                                    <h5 class="card-title">${repo.name}</h5>
                                    <p class="card-text">${repo.description || 'No description available'}</p>
                                    <p class="card-text">Updated: ${new Date(repo.updated_at).toLocaleDateString()}</p>
                                    <button class=" btn btn-primary"> ${repo.language || 'N/A'}</button>

                                </div>
                            </div>
                        </div>`;
        repositoriesContainer.append(repoCard);
    });

    displayPaginationLinks();
}
function fetchRepositories(username, page, perPage) {
    const apiUrl = `https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`;
    
    $("#loader").removeClass("hidden").text("Loading...");

    $.get(apiUrl)
        .done(function (data) {
            console.log("Repositories Data:", data);
            displayRepositories(data);
            displayPaginationLinks(data.length, page, perPage);
        })
        .fail(function (error) {
            $("#loader").text(`Error: ${error.responseJSON.message}`);
        })
        .always(function () {
            $("#loader").addClass("hidden");
        });
}

function displayUserInfo(userInfo) {
    $("#user-name").text(userInfo.name || userInfo.login);

    const avatarUrl = `https://avatars.githubusercontent.com/${userInfo.login}`;
    $("#user-avatar").attr("src", avatarUrl);
    const bio = userInfo.bio || 'No bio available';
    $("#user-bio").text(`Bio: ${bio}`);
    const city = userInfo.location || 'Unknown';
    $("#user-city").text(`City: ${city}`);

    if (userInfo.twitter_username) {
        const twitterLink = `<p class="card-text">Twitter: <a href="https://twitter.com/${userInfo.twitter_username}" target="_blank">@${userInfo.twitter_username}</a></p>`;
        $("#user-info-container").append(twitterLink);
    }

    const profileUrl = userInfo.html_url;
    $("#user-name").wrap(`<a class="text-decoration-none fw-bold" href="${profileUrl}" target="_blank"></a>`);

}


function displayPaginationLinks(totalItems, currentPage, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = $("#pagination-container");
    paginationContainer.empty();

    // Previous button
    const prevButton = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                          <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
                        </li>`;
    paginationContainer.append(prevButton);

    // Page links
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = `<li class="page-item ${i === currentPage ? 'active' : ''}">
                            <a class="page-link" href="#" data-page="${i}">${i}</a>
                          </li>`;
        paginationContainer.append(pageLink);
    }

    // Next button
    const nextButton = `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                          <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
                        </li>`;
    paginationContainer.append(nextButton);

    // Add click event listener to each page link
    $(".page-link").on("click", function (e) {
        e.preventDefault();
        const page = parseInt($(this).data("page"));
        fetchRepositories($("#username").val(), page, itemsPerPage);
    });
}
