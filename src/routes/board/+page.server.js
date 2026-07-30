// src/routes/board/+page.server.js
export async function load({ locals }) {
	const boardMembers = await locals.pb.collection('board_members').getFullList();
	const boardMeetings = await locals.pb.collection('board_meetings').getList(1, 12, {
		sort: '-meetingDateTime'
	});

	const activeMembers = boardMembers.filter((member) => {
		return member.active === true;
	});

	const inactiveMembers = boardMembers.filter((member) => {
		return member.active !== true;
	});

	return { activeMembers, inactiveMembers, boardMeetings };
}
