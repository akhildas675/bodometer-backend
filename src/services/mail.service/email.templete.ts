

const BODOMETER_LOGO =
  "https://bodometer-asset.s3.eu-north-1.amazonaws.com/logo/Bodometer+Logo+corrected+1.png";

const BODOMETER_ICON =
  "https://bodometer-asset.s3.eu-north-1.amazonaws.com/logo/Bodometer+Icon.png";

export const bodometerEmailLayout = ({
  title,
  preheader,
  content,
}: {
  title: string;
  preheader?: string;
  content: string;
}): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${title}</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0B0B0F;
      font-family:
        Arial,
        Helvetica,
        sans-serif;
      color: #F8FAFC;
    }

    table {
      border-spacing: 0;
      border-collapse: collapse;
    }

    .email-wrapper {
      width: 100%;
      background-color: #0B0B0F;
      padding: 40px 20px;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #11131A;
      border: 1px solid #25283A;
      border-radius: 16px;
      overflow: hidden;
    }

    .header {
      padding: 32px 32px 24px;
      text-align: center;
      background:
        linear-gradient(
          135deg,
          #11131A 0%,
          #151225 100%
        );
      border-bottom: 1px solid #25283A;
    }

    .logo {
      width: 180px;
      max-width: 80%;
      height: auto;
    }

    .content {
      padding: 40px 32px;
    }

    .title {
      margin: 0 0 16px;
      font-size: 26px;
      line-height: 1.3;
      font-weight: 700;
      color: #F8FAFC;
    }

    .text {
      margin: 0 0 16px;
      font-size: 15px;
      line-height: 1.7;
      color: #94A3B8;
    }

    .otp-container {
      margin: 30px 0;
      padding: 24px;
      text-align: center;
      background-color: #0B0B0F;
      border: 1px solid #25283A;
      border-radius: 12px;
    }

    .otp {
      margin: 0;
      font-size: 36px;
      line-height: 1;
      font-weight: 700;
      letter-spacing: 10px;
      color: #16C5FF;
    }

    .button-container {
      margin: 30px 0;
      text-align: center;
    }

    .button {
      display: inline-block;
      padding: 14px 28px;
      border-radius: 10px;
      background-color: #7C3AED;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
    }

    .notice {
      margin-top: 24px;
      padding: 16px;
      background-color: #161923;
      border-left: 3px solid #16C5FF;
      border-radius: 6px;
    }

    .notice-text {
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
      color: #94A3B8;
    }

    .footer {
      padding: 28px 32px;
      text-align: center;
      border-top: 1px solid #25283A;
      background-color: #0E1016;
    }

    .footer-icon {
      width: 32px;
      height: 32px;
      margin-bottom: 12px;
    }

    .footer-text {
      margin: 0;
      font-size: 12px;
      line-height: 1.6;
      color: #64748B;
    }

    .brand {
      color: #16C5FF;
      font-weight: 600;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }

      .content {
        padding: 30px 20px;
      }

      .header {
        padding: 26px 20px 20px;
      }

      .title {
        font-size: 22px;
      }

      .otp {
        font-size: 30px;
        letter-spacing: 7px;
      }
    }
  </style>
</head>

<body>

  ${
    preheader
      ? `
      <div
        style="
          display:none;
          max-height:0;
          overflow:hidden;
          opacity:0;
        "
      >
        ${preheader}
      </div>
      `
      : ""
  }

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    class="email-wrapper"
  >
    <tr>
      <td align="center">

        <table
          role="presentation"
          class="email-container"
          cellpadding="0"
          cellspacing="0"
        >

          <!-- HEADER -->

          <tr>
            <td class="header">

              <img
                src="${BODOMETER_LOGO}"
                alt="Bodometer"
                class="logo"
              />

            </td>
          </tr>

          <!-- CONTENT -->

          <tr>
            <td class="content">

              ${content}

            </td>
          </tr>

          <!-- FOOTER -->

          <tr>
            <td class="footer">

              <img
                src="${BODOMETER_ICON}"
                alt="Bodometer"
                class="footer-icon"
              />

              <p class="footer-text">
                © ${new Date().getFullYear()} Bodometer.
                All rights reserved.
              </p>

              <p class="footer-text">
                Your fitness. Your journey.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};