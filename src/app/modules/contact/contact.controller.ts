import httpStatus from 'http-status';
import sendEmail from '../../helpers/email';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ejs from 'ejs';
import path from 'path';

const emailContactController = catchAsync(async (req, res) => {
  const body = req.body;

  const templatePath = path.join(
    // eslint-disable-next-line no-undef
    __dirname,
    '../../utils/templates/contactEmail/html.ejs',
  );
  const emailTemplate = await ejs.renderFile(templatePath, {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phoneNumber: body.phoneNumber,
    subject: body.subject,
    message: body.message,
  });

  await sendEmail('prince9nazir@gmail.com', body.subject, emailTemplate);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Sccessfully send email',
    data: body,
  });
});

export default emailContactController;
