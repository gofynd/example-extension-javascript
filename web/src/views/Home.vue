<template>
  <div class="fp-extension-landing-page">
    <div class="fp-extension-saleschannel-title">Sales Channel</div>

    <loader v-if="pageLoading"></loader>
    <div v-else class="content">
      <nitrozen-input
        type="search"
        placeholder="Search Sales Channels"
        :showSearchIcon="true"
        class="application-list"
        @input="searchApplication"
      ></nitrozen-input>

      <div class="fp-extension-sales-channels-container">
        <div
          :key="application._id"
          class="fp-extension-app-box"
          v-for="application of applications_list"
        >
          <div class="logo">
            <img :src="application.logo" />
          </div>
          <div class="line-1">{{ application.name }}</div>
          <div class="line-2">{{ application.domain.name }}</div>
          <div class="fp-extension-list-btn-cont"></div>
        </div>

        <div
          v-if="applications_list.length % 3 == 2"
          class="fp-extension-app-box hidden"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
/* File imports */
import Loader from "../components/loader.vue";
import { NitrozenInput } from "@gofynd/nitrozen-vue";

/* Service imports */
import MainService from "./../services/main-service";

export default {
  name: "fp-extension-homepage",
  components: {
    Loader,
    "nitrozen-input": NitrozenInput,
  },
  data() {
    return {
      applications_list: [],
      all_applications: [],
      pageLoading: false,
    };
  },
  mounted() {
    this.fetchApplications();
  },
  methods: {
    fetchApplications() {
      this.pageLoading = true;
      MainService.getAllApplications()
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Request failed with status: ${response.status}`);
          }
        })
        .then(data => {
          this.all_applications = data.items;
          this.applications_list = data.items;
          this.applications_list.map((ele) => {
            (ele.text = ele.name),
              (ele.value = ele._id),
              (ele.image = ele.logo),
              (ele.logo = ele.image && ele.image.secure_url);
          });
          this.pageLoading = false;
        })
        .catch(() => {
          this.pageLoading = false;
          this.$snackbar.global.showError(
            "Failed to fetch the list of all applications"
          );
        });
    },
    searchApplication(searchText) {
      if (!searchText) {
        this.applications_list = this.all_applications.map((app) => app);
      } else {
        this.applications_list = this.all_applications.filter((item) => {
          return item.name.toLowerCase().includes(searchText.toLowerCase());
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.fp-extension-landing-page {
  font-family: "Inter";
  position: relative;
  width: 100%;
  box-sizing: border-box;
  max-width: 1024px;
  margin: 24px auto;

  .fp-extension-saleschannel-title {
    font-weight: 700;
    font-size: larger;
    margin-bottom: 8px;
  }

  .fp-extension-sales-channels-container {
    display: flex;
    flex-wrap: wrap;
    margin: 24px 0;
    justify-content: space-between;

    .fp-extension-list-btn-cont {
      display: flex;
      justify-content: flex-end;

      .fp-extension-list-btn {
        display: flex;
        width: 40px;
        height: 40px;
        border: 1px solid #e4e5e6;
        border-radius: 4px;
        justify-content: center;
        align-items: center;
        cursor: pointer;
      }
    }
  }

  .fp-extension-app-box {
    width: 261px;
    height: auto;
    background-color: white;
    border: 1px solid #e4e5e6;
    padding: 24px;
    border-radius: 4px;
    margin-bottom: 24px;

    & + .fp-extension-app-box:nth-child(3n + 1) {
      margin-left: 0;
    }

    .logo {
      width: 48px;
      height: 48px;

      img {
        width: 100%;
        height: auto;
      }
    }

    .line-1 {
      font-weight: 600;
      font-size: 16px;
      line-height: 26px;
    }

    .line-2 {
      color: #9b9b9b;
      line-height: 22px;
      font-size: 12px;
    }
  }
}

.hidden {
  visibility: hidden;
}
</style>
